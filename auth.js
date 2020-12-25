const { ipcRenderer } = require("electron");

// globals
let option;

document.getElementById('auth-btn').addEventListener('click', (e) => {
    e.preventDefault();
    var auth = {
        user : document.getElementById('username').value,
        pass : document.getElementById('password').value,
        option : option
    }
    console.log(auth);
    ipcRenderer.send('app:processAuth', auth);
});

document.getElementById('cancel-btn').addEventListener('click', (e) => {
    ipcRenderer.send('app:cancelAuth');
});