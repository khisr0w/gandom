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

// read barcode event
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
            submitBarcode();
            return true;
        } else return false;
    } else return false;
}

function captureBarcode(e) {

    if (e.keyCode == 13) {
        isPrefixMet = false;
    } else barcode += e.key;
}

function makeItemCard(queryResult) {

    var h4 = document.createElement('h4');
    //h4.classList.add('card-title');
    h4.textContent = queryResult.productName;

    var strong = document.createElement('strong');
    strong.textContent = "Price: ";

    var span = document.createElement('span');
    span.textContent = queryResult.price + "Afs";

    var p = document.createElement('p');
    //p.classList.add('card-text');
    p.appendChild(strong);
    p.appendChild(span);

    var div = document.createElement('div');
    //div.classList.add("card-body");
    div.appendChild(h4);
    div.appendChild(p);

    var p2 = document.createElement('p');
    //h5.classList.add('card-header');
    p2.textContent = "Expiration Date: " + queryResult.expDate;

    var label = document.createElement('label');
    label.setAttribute("for", "amount");
    label.textContent = "Select the amount: ";
    
    var select = document.createElement('select');
    select.setAttribute("name", "amount");
    select.setAttribute("id", "amount");

    for(i = 1; i <= Number(queryResult.remAmount); i++) {

        var option = document.createElement('option');
        option.setAttribute("value", i);
        option.textContent = i;
        console.log(i);
        select.appendChild(option);
    }

    var div2 = document.createElement('div');
    //root.classList.add('card');
    div2.appendChild(p2);
    div2.appendChild(label);
    div2.appendChild(select);

    var div3 = document.createElement('div');
    div3.classList.add("card-content");
    div3.appendChild(div);
    div3.appendChild(div2);

    var root = document.createElement('div');
    root.classList.add("purchase-card");
    root.appendChild(div3);

    var cardContainer = document.querySelector(".purchase .card-container");
    cardContainer.appendChild(root);
    cardContainer.scrollTop = cardContainer.scrollHeight;
}

function submitBarcode() {
    setTimeout(() => {
        if (!isPrefixMet) {
            ipcRenderer.send("app:queryToDatabase", barcode);
            barcode = "";
        }
    }, 250)
}


// Incoming events for Renderer process
ipcRenderer.on('app:queryFromDatabase', (e, result) => {
    if(result) makeItemCard(result);
});