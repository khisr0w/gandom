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
const {
    ResumeToken
} = require('mongodb');
const pool = mariadb.createPool({
    host: 'localhost',
    user: 'cashier',
    password: 'CashierPass',
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
    mainWindow.setMenuBarVisibility(false);

}

const {
    MenuItem
} = require('electron')

const menu = new Menu()
menu.append(new MenuItem({
    label: 'Root',
    submenu: [{
        label: 'Access Register Root Privileges',
        accelerator: process.platform === 'darwin' ? 'Alt+Cmd+R' : 'Ctrl+R',
        click: () => {
            openRegisterRootWindow()
        }
    },{
        label: 'Access Update Root Privileges',
        accelerator: process.platform === 'darwin' ? 'Alt+Cmd+U' : 'Ctrl+U',
        click: () => {
            openUpdateRootWindow()
        }
    }]
}))

Menu.setApplicationMenu(menu)

// Incoming events for Main process
app.on('ready', () => {
    openMainWindow();
    // Register and start hook
    initDatabase();
    //openUpdateRootWindow();
    //openRegisterRootWindow();
});

ipcMain.on('app:exit', (e) => {
    app.quit()
});

ipcMain.on('app:queryToDatabase', async (e, barcode) => {

    var result = await queryBarcode(pool, barcode);
    //console.log(result);
    e.reply('app:queryFromDatabase', result);
});

// Database Functions
function initDatabase() {
    var dbPath = path.resolve('./db/bin/' + "mariadbd.exe");
    if (process.env.NODE_ENV == 'production') {
        dbPath = path.resolve('../db/bin/' + "mariadbd.exe");
    }
    const Server = execFile(dbPath, ['--console'], {
        windowsHide: true
    }, (error, stdout, stderr) => {});

    Server.on('close', code => {
        app.exit(-1);
        console.log(dialog.showErrorBox("Gandom Inventory", "Fatal Error! connection to database failed.\nExiting..."));
    });
    console.log(dbPath);
}

async function queryDatabase(auth, query) {

    let conn;
    let result;
    try {
        conn = await auth.getConnection();
        const rows = await conn.query(query);
        result = rows;

    } catch (err) {
        throw err;
    } finally {
        if (conn) {
            conn.end();
        }
    }

    return result;
}
async function queryBarcode(pool, barcode) {
    var result = await queryDatabase(pool, `select * from products where barcode = "${barcode}"`);
    return result[0];
}

// +=====================| ROOT REGISTER PRIVILEGES STARTS HERE |===========================+

// root database initialization
const root = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Kaspersky1',
    database: 'gandom',
    connectionLimit: 5
});

function openRegisterRootWindow() {
    mainWindow = new BrowserWindow({
        title: "Register Root Privilege",
        width: 550,
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
    mainWindow.loadFile(path.join(__dirname, "root-register.html"));
    mainWindow.setMenu(null);
}

// root incoming events for Main process
ipcMain.on('app:addToDatabase', async (e, product) => {

    var result = await queryBarcode(root, product.barcode);

    if(result) {
        console.log(dialog.showErrorBox("Gandom Inventory", "Fatal Error! Barcode is already registered"));
    }
    else {
        var result = await insertIntoProducts(root, product);
        if(result){
            options = {
                type: "info",
                title: "Gandom Inventory",
                message: "Product Successfully registered!",
            }
            console.log(dialog.showMessageBox(null, options));
        }
        else {
            console.log(dialog.showErrorBox("Gandom Inventory", "Fatal Error! Product registration failed"));
        }
    }
});

ipcMain.on('app:getGeneratedBarcode', async (e) => {
    var generatedBarcode;
    var lastAuthBarcode = await getLastAuthoredBarcode(root);
    if(lastAuthBarcode) {
        generatedBarcode = generateBarcode(lastAuthBarcode.barcode);
    }
    else {
        generatedBarcode = "GMS0000000000";
    }
    e.reply("app:response_getGeneratedBarcode", generatedBarcode);
});

// root database functions
async function insertIntoProducts(auth, product) {
    let conn;
    let result;
    try {
        conn = await auth.getConnection();
        const res = await conn.query(`insert into products values(NULL, ?, ?, ?, ?, ?, ?, ?)`, [product.barcode,
                                                                                                product.productName,
                                                                                                parseInt(product.price),
                                                                                                parseInt(product.remAmount),
                                                                                                product.regDate,
                                                                                                product.expDate,
                                                                                                product.description]);
        //console.log(res); // { affectedRows: 1, insertId: 1, warningStatus: 0 }
    } catch (err) {
        return false
    } finally {
        if (conn) conn.end();
    }

    return true;
};

async function getLastAuthoredBarcode(root) {

    var result = await queryDatabase(root, 'select * from products where barcode like "GMS%" order by barcode DESC');

    return result[0];
}

function generateBarcode(lastAuthBarcode) {
    var prefix = "GMS";
    var incremented = parseInt(lastAuthBarcode.substring(3, lastAuthBarcode.length)) + 1;

    var charsToAdd = lastAuthBarcode.length - (String(incremented).length + prefix.length);
    for (i = 0; i < charsToAdd; i++) {
        prefix += "0";
    }
    var result = String(prefix + incremented);

    return result;
}

// +=====================| ROOT UPDATE PRIVILEGES STARTS HERE |===========================+

function openUpdateRootWindow() {
    mainWindow = new BrowserWindow({
        title: "Update Root Privilege",
        width: 465,
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
    mainWindow.loadFile(path.join(__dirname, "root-update.html"));
    mainWindow.setMenu(null);
}

async function updateProduct(auth, product) {
    let conn;
    let result;
    try {
        conn = await auth.getConnection();
        const res = await conn.query(`update products set productName = ?, price = ?, remAmount = ?, 
                                      regDate = ?, expDate = ?, description = ? where barcode = ?`,
                                      [product.productName,
                                       parseInt(product.price),
                                       parseInt(product.remAmount),
                                       product.regDate,
                                       product.expDate,
                                       product.description,
                                       product.barcode]);
        console.log(res); // { affectedRows: 1, insertId: 1, warningStatus: 0 }
    } catch (err) {
        return false
    } finally {
        if (conn) conn.end();
    }

    return true;
}

// events from renderer process
ipcMain.on('app:getProduct', async (e, barcode) => {
    
    var result = await queryDatabase(root, 'select barcode, productName, price, remAmount, DATE_FORMAT(regDate, "%Y-%m-%d") as regDate, DATE_FORMAT(expDate, "%Y-%m-%d") as expDate, description from products where barcode="'+barcode+'"');

    if(result[0]) {

        e.reply('app:response_getProduct', result[0], true);
    }
    else {

        e.reply('app:response_getProduct', "", false);
        dialog.showErrorBox("Gandom Inventory", "Fatal Error! \nThere is no entry associated with this barcode");
    }
});

ipcMain.on('app:updateDatabase', async (e, product) => {

    var result = await updateProduct(root, product);

    if(result) {
        options = {
            type: "info",
            title: "Gandom Inventory",
            message: "Product Successfully updated!",
        }

        console.log(dialog.showMessageBox(null, options));

        e.reply('app:response_updateDatabase', result[0], true);
    }
    else {

        e.reply('app:response_updateDatabase', "", false);
        dialog.showErrorBox("Gandom Inventory", "Fatal Error! \nProduct update failed");
    }
});