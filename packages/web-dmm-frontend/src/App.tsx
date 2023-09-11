import React from 'react'
import { Xdm1241Display, useXdm1241 } from './xdm1241/xdm1241-react'
import './app.css'

export type AppProps = object
export const App: React.FC<AppProps> = () => {
    const { xdm1241, xdm1241State, connect } = useXdm1241()

    return (
        <>
            {xdm1241 !== null ? (
                <Xdm1241Display
                    state={xdm1241State}
                    />
            ) : navigator.serial ? (
                    <button onClick={connect}>
                        Connect via Web Serial
                    </button>
            ) : (
                <div>
                    Sorry, Web Serial API isn't available in your browser. Try the latest version of Chrome.
                </div>
            )}
        </>
    )
}
