// importing libraries
const electron = require('electron');
const {
    ipcRenderer
} = electron;

// Barcode identification variables
let prefix = [];
let isPrefixMet = false;
let barcode = "";

// exit button functionaliy
const exitBtn = document.querySelector("#exit-btn");
exitBtn.addEventListener('click', (e) => {
    ipcRenderer.send('app:exit');
});

document.body.addEventListener('keydown', (e) => {

    if (isPrefixMet) captureBarcode(e);
    else isPrefixMet = matchPrefix(e);
});

function matchPrefix(e) {

    if (e.keyCode == 49 && prefix.length == 0) {
        prefix.push(e.keyCode);
        return false;
    } else if (e.keyCode == 190) {
        if (prefix[0] == 49) {
            prefix = [];
            return true;
        } else return false;
    } else return false;
}

function captureBarcode(e) {

    if (e.keyCode == 13) {
        makeItemCard(barcode);
        console.log(barcode);
        barcode = "";
        isPrefixMet = false;
    } else barcode += e.key;
}

function makeItemCard(barcodeText) {

    var p = document.createElement('p');
    p.classList.add('card-text');
    p.textContent = "The description of the text will the here and it may contain things such as expiration date, manufactured date and more...";

    var h4 = document.createElement('h4');
    h4.classList.add('card-title');
    h4.textContent = "Name of Product";

    var div = document.createElement('div');
    div.classList.add("card-body");
    div.appendChild(h4);
    div.appendChild(p);

    var h5 = document.createElement('h5');
    h5.classList.add('card-header');
    h5.textContent = barcodeText;

    var root = document.createElement('div');
    root.classList.add('card');
    root.appendChild(h5);
    root.appendChild(div);
    root.style.margin = '0 0 20px'
    
    document.querySelector(".purchase .card-container").appendChild(root);
}