import { useContext, useState } from 'react'
import { LEDsContext } from './LEDsContext'

import styles from './App.module.scss'

function App() {
    let [r, setR] = useState(0)
    let [g, setG] = useState(0)
    let [b, setB] = useState(0)

    let api = window.api
    const leds = useContext(LEDsContext)

    return (
        <div className={ styles.app }>
            <input 
                type="number"
                min="0"
                max="255"
                value={ r }
                onChange={ event => setR(event.target.value) }
                className={ styles.r }
            />
            <input 
                type="number"
                min="0"
                max="255"
                value={ g }
                onChange={ event => setG(event.target.value) }
                className={ styles.g }
            />
            <input 
                type="number"
                min="0"
                max="255"
                value={ b }
                onChange={ event => setB(event.target.value) }
                className={ styles.b }
            />

            <button 
                type="button"
                onClick={ () => leds.set(r, g, b) }
            >
                send
            </button>
        </div>
    )
}

export default App
