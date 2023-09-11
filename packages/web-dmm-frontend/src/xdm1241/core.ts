import _ from "lodash";
import { sleep } from "../util";

const BAUD = 115200

export type Xdm1241State = {
    measure: string,
    function: string,
}

export class Xdm1241 {
    private readonly decoder = new TextDecoder('ascii');
    private readonly encoder = new TextEncoder();

    private port: SerialPort | null
    private portAvailable: boolean
    private publishState: (state: Xdm1241State) => void

    private state: Xdm1241State = {
        measure: "",
        function: "",
    }

    private pending: ((line: string) => void) | null = null

    constructor(port: SerialPort, publishState: (state: Xdm1241State) => void) {
        this.port = port
        this.portAvailable = true
        this.publishState = publishState
        this.port.addEventListener('disconnect', () => {
            console.log('shutting down on disconnect')
            this.port = null
            this.portAvailable = false
        })
    }

    public async openAndLoop() {
        if (this.port === null) {
            return
        }
        await this.port.open({baudRate: BAUD})
        if (this.port.readable === null || this.port.writable === null) {
            throw new Error('Port missing readable or writable!')
        }

        await sleep(100)

        let buffer = new Uint8Array()
        const reader = this.port.readable.getReader()
        try {
            this.poll() // no await
            // eslint-disable-next-line no-constant-condition
            while (true) {
                const {value, done} = await reader.read()
                if (done) {
                    break
                }
                if (value !== undefined) {
                    buffer = Uint8Array.from([...buffer, ...value])
            
                    let i: number
                    // Iterate newline-delimited strings
                    while ((i = buffer.indexOf('\n'.charCodeAt(0))) != -1) {
                        const raw_line = buffer.subarray(0, i)
                        buffer = buffer.slice(i + 1)
                        const line = this.decoder.decode(raw_line)
                            .replaceAll(String.fromCharCode(0xa6, 0xb8), 'Ω')
                            .replaceAll(String.fromCharCode(0xaa, 0xcc), 'μ')
                            .replaceAll(String.fromCharCode(0xa1, 0xe6), '℃')
                            .replaceAll(String.fromCharCode(0xa8, 0x48), '℉')
                            .trim()
                        if (this.pending !== null) {
                            this.pending(line)
                        } else {
                            console.warn('Unexpected line', line)
                        }
                    }
                }
            }
        } finally {
            console.log('Releasing reader')
            reader.releaseLock()
        }
    }

    private async poll() {
        const idn = await this.sendCommandForResponse('*IDN?')
        console.log('IDN', idn)
        await sleep(100)
        let i = 0
        while (this.port !== undefined) {
            const measure = await this.sendCommandForResponse('MEAS:SHOW?')
            if (measure !== null) {
                this.state.measure = measure
            }
            if (i % 10 == 0) {
                const func = await this.sendCommandForResponse('FUNC?')
                if (func !== null) {
                    this.state.function = func.replaceAll('"', '')
                }
            }
            console.log(this.state)
            this.publishState(_.cloneDeep(this.state))
            await sleep(25)
            i++;
        }
    }

    private async sendCommandForResponse(command: string) {
        if (this.pending !== null) {
            throw new Error('Another command is already pending')
        }
        const promise = new Promise<string | null>((resolve) => {
            const timeout = setTimeout(() => {
                console.log('Timeout waiting for response', command)
                this.pending = null
                resolve(null)
            }, 500)
            this.pending = (response: string) => {
                this.pending = null
                clearTimeout(timeout)
                resolve(response)
            }
        })
        await this.sendString(command + '\n')
        return promise
    }

    private async sendString(s: string) {
        return this.sendBytes(this.encoder.encode(s))
    }

    private async sendBytes(packet: Uint8Array) {
        const writer = this.port?.writable?.getWriter()
        try {
            await writer?.write(packet).catch(this.onError)
            return
        } finally {
            writer?.releaseLock()
        }
    }

    private onError(e: unknown) {
        console.error('Error writing serial', e)
        this.port?.close()
        this.port = null
        this.portAvailable = false
    }
}
