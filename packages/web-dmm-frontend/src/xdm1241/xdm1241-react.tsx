import { useState } from "react";
import { Xdm1241, Xdm1241State } from "./core";

export const useXdm1241 = () => {
    const [xdm1241, setXdm1241] = useState<Xdm1241 | null>(null);
    const [xdm1241State, setXdm1241State] = useState<Xdm1241State>({
        measure: "",
        function: "",
    })
    const connect = async () => {
        try {
            if (navigator.serial) {
                const serialPort = await navigator.serial.requestPort()
                serialPort.addEventListener('disconnect', () => {
                    setXdm1241(null)
                })
                const xdm1241 = new Xdm1241(serialPort, setXdm1241State)
                setXdm1241(xdm1241)
                const loop = xdm1241.openAndLoop()
                await loop
            } else {
                console.error('Web Serial API is not supported in this browser.')
                setXdm1241(null)
            }
        } catch (error) {
            console.error('Error with serial port:', error)
            setXdm1241(null)
        }
    }
    return {
        xdm1241,
        xdm1241State,
        connect,
    }
}

export type Xdm1241Props = {
    state: Xdm1241State
}

const SPLIT_VALUE_REGEX = /^(-?\d+(\.\d+)?)\s*(\S+)$/
export const Xdm1241Display: React.FC<Xdm1241Props> = ({state}) => {
    const valueMatch = state.measure.match(SPLIT_VALUE_REGEX)
    let value = ""
    let units = ""
    if (valueMatch) {
        value = valueMatch[1]
        units = valueMatch[3]
    } else {
        value = state.measure
    }
    return (
            <div style={{
                display: 'flex',
                width: '12em',
                flexDirection: 'column',
                alignItems: 'flex-end',
                backgroundColor: '#333',
                padding: '10px',
                borderRadius: '8px',
                color: 'yellow',
                fontFamily: 'Fira Sans, sans-serif',
                fontVariantNumeric: 'tabular-nums',
            }}>
                <div style = {{
                    fontSize: '3em',
                    fontWeight: 200,
                    padding: '0px',
                    lineHeight: '1',
                    minHeight: '1em',
                }}>{value}</div>
                <div style = {{
                    fontSize: '1.5em',
                    fontWeight: 600,
                    padding: '0',
                    lineHeight: '1',
                    minHeight: '1em',
                }}>{units}</div>
            </div>
    )
}
