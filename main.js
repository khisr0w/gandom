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

const {
    app,
    BrowserWindow,
    globalShortcut,
    Menu,
    ipcMain
} = electron;

// Using MariaDB
const mariadb = require('mariadb');
const { ResumeToken } = require('mongodb');
const pool = mariadb.createPool({
     host: 'localhost', 
     user:'cashier', 
     password: 'cashierPass',
     database: 'gandom',
     connectionLimit: 5
});

process.env.NODE_ENV = 'production';

// Block-Scope varaibles
let mainWindow;

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
    //if (process.env.NODE_ENV == 'production') mainWindow.setMenu(null);
}

const { MenuItem } = require('electron')

const menu = new Menu()
menu.append(new MenuItem({
  label: 'Root',
  submenu: [{
    role: 'Access Root Privileges',
    accelerator: process.platform === 'darwin' ? 'Alt+Cmd+R' : 'Alt+Shift+R',
    click: () => { openRootWindow() }
  }]
}))

Menu.setApplicationMenu(menu)

// Incoming events for Main process
app.on('ready', () => {
    openMainWindow();
    // Register and start hook
    initDatabase();
});

ipcMain.on('app:exit', (e) => {
    app.quit()
});

ipcMain.on('app:queryToDatabase', async (e, barcode) => {
    // var newBarcode = "This is the barocode: " + barcode;

    var result = await queryBarcode(pool, barcode);
    //console.log(result);
    e.reply('app:queryFromDatabase', result);
});

// Database Functions
function initDatabase() {
    var dbPath = path.resolve('./db/bin/' + "mariadbd.exe");
    const Server = execFile(dbPath, ['--console'], {
        windowsHide: true
    }, (error, stdout, stderr) => {});

    Server.on('close', code => {
        app.exit(-1);
        console.log(dialog.showErrorBox("Gandom Inventory", "Fatal Error! connection to database failed.\nExiting..."));
    });
    console.log(dbPath);
}

async function queryBarcode(pool, barcode) {
    let conn;
    let result;
    try {
      conn = await pool.getConnection();
      const rows = await conn.query("select * from products where barcode=" + barcode);
      result = rows[0];
      //console.log(result);
    //   console.log(res);
  
    } catch (err) {
      throw err;
    } finally {
      if (conn) {
        conn.end();
      }
    }

    return result;
}

// +=====================| ROOT PRIVILEGES STARTS HERE |===========================+

function openRootWindow() {
    mainWindow = new BrowserWindow({
        title: "Root Privilege",
        width: 960,
        height: 540,
        fullscreen: false,
        // alwaysOnTop: true,
        // skipTaskbar: true,
        // resizable: false,
        // frame: false,
        webPreferences: {
            nodeIntegration: true
        }
    })
    mainWindow.loadFile(path.join(__dirname, "root.html"));
    if (process.env.NODE_ENV == 'production') mainWindow.setMenu(null);
}

function insertItem() {
    //const res = await conn.query("INSERT INTO myTable value (?, ?)", [1, "mariadb"]);
};

function updateItem() {}