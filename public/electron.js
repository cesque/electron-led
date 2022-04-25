const { app, BrowserWindow, Tray, screen, Menu, ipcMain, nativeImage } = require('electron')
const path = require('path')
const { SerialPort } = require('serialport')

let port = { write: () => {}, on: () => {} }
try {
    port = new SerialPort({
        path: 'COM3',
        baudRate: 57600
    })
} catch(e) {
    console.error(e)
}

const appSize = {
    width: 400,
    height: 600,
}

port.on('error', err => {
    console.error('error: ' + err)
})

function createWindow() {
    // create window at bottom right
    let display = screen.getPrimaryDisplay()

    const window = new BrowserWindow({
        width: appSize.width,
        height: appSize.height,
        x: display.bounds.width - appSize.width,
        y: display.bounds.height - appSize.height,
        resizable: false,
        movable: false,
        minimizable: false,
        maximizable: false,
        fullscreenable: false,
        alwaysOnTop: true,
        frame: false,
        skipTaskbar: true, 
        // show: false,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        },
    })

    window.on('blur', () => window.hide())

    //load the index.html from a url
    window.loadURL('http://localhost:3000');

    // Open the DevTools.
    // window.webContents.openDevTools()

    return window
}

function makePresetMenuItem(preset) {
    // why is it BGR and not RGB? something is weird here
    let buffer = Buffer.from([ 
        preset.b, preset.g, preset.r, 255,
    ])

    let image = nativeImage.createFromBuffer(buffer, { width: 1, height: 1 })
    image = image.resize({
        width: 16, 
        height: 16
    })

    return {
        label: preset.default ? 'Preset' : 'Saved',
        type: 'normal',
        icon: image,
        click: event => changeColor(preset.r, preset.g, preset.b),
    }
}

function createContextMenu(window, tray, presetData) {
    presets = presetData?.presets ?? []
    saved = presetData?.saved ?? []
    console.log(presets, saved)

    let contextMenuArray = [
        { 
            label: 'Quit',
            type: 'normal',
            click: event => app.quit(),
        },
    ]

    let presetsMenuArray = presets.map(makePresetMenuItem)
    if(presetsMenuArray.length) {
        presetsMenuArray.push({
            type: 'separator',
        })
    }
    let savedMenuArray = saved.map(makePresetMenuItem)
    if(savedMenuArray.length) {
        savedMenuArray.push({
            type: 'separator',
        })
    }

    let combinedMenuArray = [
        ...savedMenuArray,
        ...presetsMenuArray,
        ...contextMenuArray,
    ]

    const contextMenu = Menu.buildFromTemplate(combinedMenuArray)

    tray.setContextMenu(contextMenu)
    tray.on('click', () => window.show())
    
    let display = screen.getPrimaryDisplay()
    let trayBounds = tray.getBounds()
    let windowPosition = window.getPosition()
    window.setPosition(windowPosition[0], display.bounds.height - appSize.height - trayBounds.height)
}

app.whenReady().then(() => {
    // create tray icon
    let window = createWindow()

    let tray = new Tray(path.join(__dirname, '/led-icon.png'))
    createContextMenu(window, tray)
    setUpAPI(window, tray)

    setTimeout(() => {
        
    }, 1000)
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

app.on('before-quit', () => {
    tray.destroy()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

function changeColor(r, g, b) {
    r = Math.max(0, Math.min(255, r))
    g = Math.max(0, Math.min(255, g))
    b = Math.max(0, Math.min(255, b))

    let buffer = Buffer.from([r, g, b])

    port.write(buffer, e => {
        if(e) {
            console.error(e)
        } else {
            console.log('success')
        }
    })
}

function setUpAPI(window, tray) {
    ipcMain.handle('set', async (event, data) => {
        console.log(`set: ${ data.r }, ${ data.g }, ${ data.b }`)
        
        changeColor(data.r, data.g, data.b)
    })

    ipcMain.handle('set presets', async (event, data) => {
        createContextMenu(window, tray, data)
    })
}