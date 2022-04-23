import React, { useState } from 'react'

const leds = {
    set: (r, g, b) => window.api.send('set', { r, g, b }) 
}

export const LEDsContext = React.createContext(leds)

const LEDs = ({ children }) => {
    return <LEDsContext.Provider value={{ leds }}>
        { children }
    </LEDsContext.Provider>
};

export default LEDs;