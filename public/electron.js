const { app, BrowserWindow, Tray, screen, Menu, ipcMain } = require('electron')
const path = require('path')
const { SerialPort } = require('serialport')

let window = null
const port = new SerialPort({
    path: 'COM3',
    baudRate: 57600
})

function createWindow(tray) {
    // create window at bottom right
    let display = screen.getPrimaryDisplay()
    let trayBounds = tray.getBounds()

    let appSize = {
        width: 500,
        height: 700,
    }

    const win = new BrowserWindow({
        width: appSize.width,
        height: appSize.height,
        x: display.bounds.width - appSize.width,
        y: display.bounds.height - appSize.height - trayBounds.height,
        resizable: false,
        movable: false,
        minimizable: false,
        maximizable: false,
        fullscreenable: false,
        alwaysOnTop: true,
        frame: false,
        skipTaskbar: true, 
        show: false,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        },
    })

    win.on('blur', () => win.hide())

    //load the index.html from a url
    win.loadURL('http://localhost:3000');

    // Open the DevTools.
    win.webContents.openDevTools()

    return win
}

app.whenReady().then(() => {
    // create tray icon
    let tray = new Tray(path.join(__dirname, '/logo192.png'))

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Quit', type: 'normal', click: event => app.quit() },
    ])

    let window = createWindow(tray)

    tray.setContextMenu(contextMenu)
    tray.on('click', () => window.show())
    setUpAPI()
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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

function setUpAPI() {
    ipcMain.handle('test-message', async (event, data) => {
        console.log(event, data)
    })

    ipcMain.handle('set', async (event, data) => {
        console.log(`set: ${ data.r }, ${ data.g }, ${ data.b }`)
        
        try {
            let r = Math.max(0, Math.min(255, data.r))
            let g = Math.max(0, Math.min(255, data.g))
            let b = Math.max(0, Math.min(255, data.b))
            port.write(`${ r } ${ g } ${ b }`)
        } catch(e) {
            console.error(e)
        }
    })
}