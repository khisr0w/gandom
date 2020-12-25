// importing libraries
const { ipcMain } = require('electron');
const electron = require('electron');
const {
    ipcRenderer
} = electron;

// Globals
// Barcode identification variables
let prefix = [];
let isPrefixMet = false;
let barcode = "";

let orderList = [];

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

// event listeners
document.body.onload = (e) => {

    var cardContainer = document.querySelector(".purchase .card-container");
    cardContainer.innerHTML = "";
    cardContainer.textContent = "";
};

document.querySelector('.keyboard-barcode-field').onload

document.getElementById("clear-btn").addEventListener('click', (e) => {
    var cardContainer = document.querySelector(".purchase .card-container");
    cardContainer.innerHTML = "";
    cardContainer.textContent = "";
    orderList = [];
    changeTotalPrice();
    document.activeElement.blur();
    keyboardField.focus();
    document.getElementById("process-btn").disabled = true;
});

document.getElementById("process-btn").addEventListener('click', (e) => {
    var cardContainer = document.querySelector(".purchase .card-container");
    if (cardContainer.childNodes.length) {
        document.activeElement.blur();
        document.querySelector('.keyboard-barcode-field').focus();
        for(i = 0; i < orderList; i++) {
            if(parseInt(orderList[i].price) === 0) {
                ipcRenderer.send('app:showErrorBox', 'Error! Price of an item cannot be zero');
                return;
            }
        }
        ipcRenderer.send('app:processOrder', orderList);
    } else {
        ipcRenderer.send('app:showErrorBox', 'There is not item to process the order');
        document.getElementById("process-btn").disabled = true;
    }
});

document.querySelector('.add-keyboard-barcode').addEventListener('click', (e) => {

    keyboardField = document.querySelector('.keyboard-barcode-field');
    if (keyboardField.style.display === "none") {
        keyboardField.style.display = "inline";
        keyboardField.focus();
    } else {
        keyboardField.style.display = "none";
    }
});

document.querySelector('.keyboard-barcode-field').addEventListener('keydown', (e) => {
    if (e.keyCode === 13) {
        var keyboardField = document.querySelector('.keyboard-barcode-field');
        keyboardField.style.display = "none";
        var barcode = keyboardField.value;
        keyboardField.value = "";
        ipcRenderer.send("app:queryToDatabase", barcode);
    }
});

function makeItemCard(queryResult) {

    var h4 = document.createElement('h4');
    //h4.classList.add('card-title');
    h4.textContent = queryResult.productName;

    var label = document.createElement('label');
    label.setAttribute("for", "price");
    label.textContent = "Price: ";

    var input = document.createElement('input');
    input.setAttribute("type", "number");
    input.setAttribute('name', 'price');
    input.style.marginBottom = '20px';
    input.value = queryResult.price;
    //input.setAttribute("onkeydown", "javascript:changePrice()");
    input.addEventListener("keyup", changePrice);

    var span = document.createElement('span');
    span.innerHTML = " Afs";

    var div = document.createElement('div');
    //div.classList.add("card-body");
    div.appendChild(h4);
    div.appendChild(label);
    div.appendChild(input);
    div.appendChild(span);

    var p2 = document.createElement('p');
    //h5.classList.add('card-header');
    p2.textContent = "Expiration Date: " + queryResult.expDate;

    var label = document.createElement('label');
    label.setAttribute("for", "amount");
    label.textContent = "Select the amount: ";

    var select = document.createElement('select');
    select.setAttribute("name", "amount");
    //select.style.marginTop = '10px';
    select.setAttribute("onchange", "changeOrderedAmount(this)");
    select.value = 1;

    for (i = 1; i <= Number(queryResult.remAmount); i++) {

        var option = document.createElement('option');
        option.setAttribute("value", i);
        option.textContent = i;
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
    root.setAttribute("id", queryResult.barcode);
    root.appendChild(div3);

    var cardContainer = document.querySelector(".purchase .card-container");
    cardContainer.appendChild(root);
    cardContainer.scrollTop = cardContainer.scrollHeight;
}

// Incoming events for Renderer process
ipcRenderer.on('app:queryFromDatabase', (e, result) => {
    document.body.focus();
    if (result) {
        if (result.remAmount > 0) {

            var productIndex = productExistList(result.barcode)
            if (productIndex != -1) {
                ipcRenderer.send('app:showErrorBox', 'The item is already in the card\nSelect the amount for more of it!');

            } else {
                result.amountOrdered = 1;
                orderList.push(result);
                makeItemCard(orderList[orderList.length - 1]);
                document.getElementById("process-btn").disabled = false;
                changeTotalPrice();
            }
        }
        else {
            ipcRenderer.send('app:itemDepleted');
        }
    }
    document.activeElement.blur();
});

ipcRenderer.on('app:response_processOrder', (e, result) => {
    if(result) {
        orderList = [];
        var cardContainer = document.querySelector(".purchase .card-container");
        cardContainer.innerHTML = "";
        changeTotalPrice();
        ipcRenderer.send('app:showMessageBox', "Order Completed Successfully!");
    }
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
    } else if (e.keyCode == 16) {

    } else {
        barcode += e.key;
    }
}

function submitBarcode() {
    setTimeout(() => {
        if (!isPrefixMet) {
            ipcRenderer.send("app:queryToDatabase", barcode);
            barcode = "";
        }
    }, 250)
}

function productExistList(barcode) {
    for (i = 0; i < orderList.length; i++) {
        if (orderList[i].barcode == barcode) {
            return i;
        }
    }
    return -1;
}

function changeOrderedAmount(selectItem) {

    var barcodeID = selectItem.parentElement.parentElement.parentElement.id;
    for (i = 0; i < orderList.length; i++) {
        if (orderList[i].barcode == barcodeID) {

            orderList[i].amountOrdered = parseInt(selectItem.value);
        }
    }
    changeTotalPrice();
}

function changePrice(event) {
    if(event.keyCode == 13) {
        if((this.value.length === 0) || (parseInt(this.value) === 0)) {
            this.value = "";
            ipcRenderer.send('app:showErrorBox', 'Error! price of an item cannot be zero');
        }
        else document.activeElement.blur();
    }
    else {
        var barcodeID = this.parentElement.parentElement.parentElement.id;
        var price = parseInt(this.value);
        if((this.value.length != 0) || (price != 0)) {
            for (i = 0; i < orderList.length; i++) {
                if (orderList[i].barcode == barcodeID) {
    
                    orderList[i].price = price;
                }
            }
            changeTotalPrice();
        }
    }
}

function changeTotalPrice() {

    var totalPrice = document.getElementById("total-price");
    if(orderList.length === 0) {
        totalPrice.innerHTML = "- - -";
    }
    else {
        var sum = 0;
        for (i = 0; i < orderList.length; i++) {
            sum += parseInt(orderList[i].amountOrdered) * parseInt(orderList[i].price);
        }
        var result = String(sum);
        var commaSep = "";

        if(result.length > 3) {
            var index = 0;
            var rem = result.length % 3;
            var itr = Math.trunc(result.length / 3);
            if(rem === 0)  {
                rem = 3;
            }
            else itr++;
            for(i = 1; i <= itr; i++) {
                commaSep += result.substr(index, rem);
                if (i != itr) commaSep += ",";
                index = index + rem;
                rem = 3;
            }
        }
        else {
            commaSep += result;
        }
        totalPrice.innerHTML = commaSep;
    }
}
