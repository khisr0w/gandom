// Getting the libararies imported
const electron = require('electron');
const {
    dialog
} = require('electron');
const url = require('url');
const path = require('path');
const {
    execFile
} = require('child_process');


//process.env.NODE_ENV = 'production';

// run mongod server in background
initMongoServer();

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

ipcMain.on('app:exit', (e) => {
    app.quit()
});


function openMainWindow() {
    mainWindow = new BrowserWindow({
        title: "Gandom Inventory Management System",
        width: 1920,
        height: 1018,
        fullscreen: true,
        // alwaysOnTop: true,
        // skipTaskbar: true,
        // resizable: false,
        // frame: false,
        webPreferences: {
            nodeIntegration: true
        }
    })
    mainWindow.loadFile(path.join(__dirname, "index.html"));
    if (process.env.NODE_ENV == 'production') mainWindow.setMenu(null);
}

function initMongoServer() {
    var dbPath = path.resolve('./data/db/');
    const mongodServer = execFile('mongod', ['--dbpath', dbPath], {
        windowsHide: true
    }, (error, stdout, stderr) => {});

    mongodServer.on('close', code => {
        app.exit(-1);
        console.log(dialog.showErrorBox("Gandom Inventory", "Fatal Error! connection to database failed.\nExiting..."));
    });
}

function queryItem() {

}

function insertItem() {};

function updateItem() {}