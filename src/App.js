import { useContext, useEffect, useRef, useState } from 'react'
import { LEDsContext } from './LEDsContext'
import { RgbColorPicker } from 'react-colorful'
import classNames from 'classnames'

import styles from './App.module.scss'

function App() {
    let [color, setColor] = useState({ r: 0, g: 0, b: 0 })
    let throttleTimer = useRef(null)
    let debounceTimer = useRef(null)

    let presetsFromStoreJSON = localStorage.getItem('presets')
    let presetsFromStore = null

    const defaultPresets = [
        {r: 197, g: 108, b: 240, default: true},
        {r: 255, g: 56, b: 56, default: true},
        {r: 255, g: 184, b: 184, default: true},
        {r: 255, g: 159, b: 26, default: true},
        {r: 255, g: 242, b: 0, default: true},
        {r: 50, g: 255, b: 126, default: true},
        {r: 24, g: 220, b: 255, default: true},
        {r: 126, g: 255, b: 245, default: true},
        {r: 125, g: 95, b: 255, default: true},
        {r: 61, g: 61, b: 61, default: true},
    ]

    try {
        presetsFromStore = JSON.parse(presetsFromStoreJSON)
    } catch(e) {
        console.error(e)
    }

    if(!presetsFromStore) {
        localStorage.setItem('presets', JSON.stringify([]))
        presetsFromStore = []
    }

    let [presets, setPresets] = useState(presetsFromStore)

    let api = window.api
    const leds = useContext(LEDsContext)

    useEffect(() => {
        leds.setPresets({ presets: defaultPresets, saved: presets })
    }, [])

    // not sure if throttling this is really needed
    useEffect(() => {
        // throttle set calls to once per 10ms
        if(!throttleTimer.current) {
            throttleTimer.current = setTimeout(() => {
                leds.set(color.r, color.g, color.b)
                throttleTimer.current = null
            }, 10)
        }

        // if value hasn't changed in 100ms, set leds
        clearTimeout(debounceTimer.current)
        debounceTimer.current = setTimeout(() => {
            leds.set(color.r, color.g, color.b)
        }, 100)
    }, [color])

    useEffect(() => {
        localStorage.setItem('presets', JSON.stringify(presets))
        leds.setPresets({ presets: defaultPresets, saved: presets })
    }, [presets])

    function getPresets() {
        let allPresets = [
            ...defaultPresets,
            ...presets,
        ]

        let list = [
            
        ]

        for(let preset of allPresets) {

            let presetStyles = {
                '--preset-color': `rgba(${ preset.r }, ${ preset.g }, ${ preset.b }, 1)`
            }

            list.push(
                <li
                    className={ classNames(styles.preset, styles.presetColor) }
                    style={ presetStyles }
                    key={ `${ preset.r }, ${ preset.g }, ${ preset.b }` }
                    onClick={ () => setColor(preset) }
                    onContextMenu={ () => removePreset(preset) }
                />
            )
        }

        return list
    }

    function addPreset() {
        if(!defaultPresets.includes(color) && !presets.includes(color)) {
            setPresets([...presets, color])
        }
    }

    function removePreset(preset) {
        if(preset.default) return

        let newPresets = presets.filter(p => p != preset)

        setPresets(newPresets)
    }

    
    let mainContainerClasses = classNames(styles.container, styles.containerMain)
    let secondaryContainerClasses = classNames(styles.container, styles.containerSecondary)

    let customStyles = {
        '--color': `rgba(${ color.r }, ${ color.g }, ${ color.b }, 1)`
    }

    return (
        <div className={ styles.app } style={ customStyles }>
            <div className={ mainContainerClasses }>
                <RgbColorPicker color={ color } onChange={ setColor } />
                <div className={ styles.display } />
            </div>
            <div className={ secondaryContainerClasses }>
                <ul className={ styles.presets }>
                    { getPresets() }

                    <li className={ classNames(styles.preset, styles.presetAdd) } onClick={ addPreset }>
                        <div className={ styles.presetAddInner }>
                            <svg viewBox="0 0 700 700" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                <g transform="matrix(2.10357,0,0,2.10357,-386.248,-239.005)">
                                    <path fill="currentColor" d="M350,117.6C331.445,117.6 316.398,132.643 316.398,151.202L316.398,246.401L221.199,246.401C202.64,246.401 187.597,261.444 187.597,280.003C187.597,298.558 202.64,313.605 221.199,313.605L316.398,313.605L316.398,408.804C316.398,427.363 331.441,442.406 350,442.406C368.559,442.406 383.602,427.363 383.602,408.804L383.602,313.605L478.801,313.605C497.36,313.605 512.403,298.562 512.403,280.003C512.403,261.444 497.36,246.401 478.801,246.401L383.602,246.401L383.602,151.202C383.602,132.643 368.559,117.6 350,117.6Z" />
                                </g>
                            </svg>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default App
