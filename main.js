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
});

function openMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1920,
        height: 2018,
        fullscreen: true,
        resizable: false,
        //frame: false
    })
    mainWindow.loadFile("index.html");
    if (process.env.NODE_ENV == 'production') mainWindow.setMenu(null);
}