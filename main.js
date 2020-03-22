// Getting the libararies imported
const electron = require('electron');
const url = require('url');
const path = require('path');

const {
    app,
    BrowserWindow,
    globalShortcut,
    Menu,
    ipcMain
} = electron;

// Block-Scope varaibles
let mainWindow;

app.on('ready', () => {
    openMainWindow();
    // Register and start hook
});

ipcMain.on('app:exit', (e) => { app.quit()});


function openMainWindow() {
    mainWindow = new BrowserWindow({
        title: "Gandom Inventory Management System",
        width: 1920,
        height: 1018,
        fullscreen: true,
        //alwaysOnTop: true,
        //skipTaskbar: true
        //resizable: false,
        //frame: false,
        webPreferences: {
            nodeIntegration: true
        }
    })
    mainWindow.loadFile("index.html");
    if (process.env.NODE_ENV == 'production') mainWindow.setMenu(null);
}