const electron = require('electron');
const {
    ipcRenderer
} = electron;

// Globals for Barcode identification
let prefix = [];
let isPrefixMet = false;
let barcode = ""
let scanForBarcode = false;


const loadBarcode = document.getElementById("load-barcode-btn");
const loadKeyboard = document.getElementById("load-keyboard-btn");

const barcodeLabel = document.getElementById('barcode-label');
const barcodeField = document.getElementById('barcode');

loadKeyboard.addEventListener('click', () => {
    barcodeLabel.style.display = "inline-block";
    barcodeField.style.display = "inline-block";
    barcodeField.readOnly = false;
    barcodeField.value = "";
    barcodeField.disabled = false;

    barcodeField.addEventListener('change', keyboardBarcodeDetect);
});

loadBarcode.addEventListener('click', () => {
    barcodeLabel.style.display = "inline-block";
    barcodeField.style.display = "inline-block";
    barcodeField.readOnly = true;
    barcodeField.value = "";

    if(!scanForBarcode) {
        document.body.addEventListener('keydown', initBarcodeListen);
        loadBarcode.innerHTML = "Scanning... Click to Stop";
        scanForBarcode = true;
        barcodeField.focus();
    }
    else {
        document.body.removeEventListener('keydown', initBarcodeListen);
        loadBarcode.innerHTML = "Load From Barcode Scanner";
        scanForBarcode = false;
        barcodeField.focus();
    }
});

const submit = document.querySelector('#submit-btn');
submit.addEventListener('click', (e) => {
    //console.log("submit");
    e.preventDefault();

    var result = {
        barcode: document.getElementById("barcode").value,
        productName: document.getElementById("productName").value,
        price: document.getElementById("price").value,
        remAmount: document.getElementById("remAmount").value,
        regDate: document.getElementById("regDate").value,
        expDate: document.getElementById("expDate").value,
        description: document.getElementById("description").value,
    };

    if(validate(result)) {
        // console.log(result);
        console.log(typeof(result.price));
        ipcRenderer.send("app:updateDatabase", result);        
    }
});

// Responses coming from Main process
ipcRenderer.on("app:response_updateDatabase", (e) => {

});

function initBarcodeListen(e) {
    if(isPrefixMet) captureBarcode(e);
    else isPrefixMet = matchPrefix(e);
}
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
    }
    else if (e.keyCode == 16) {

    }
    else barcode += e.key;
}

function submitBarcode() {
    setTimeout(() => {
        if (!isPrefixMet) {
            document.body.removeEventListener('keydown', initBarcodeListen);
            loadBarcode.innerHTML = "Load From Barcode Scanner";
            scanForBarcode = false;
            barcodeField.focus();
            barcodeField.readOnly = true;
            barcodeField.value = barcode;
            ipcRenderer.send('app:getProduct', barcodeField.value);
            barcodeField.focus();
            barcode = "";
        }
    }, 250)
}

function validate(list) {
    if((list.barcode.length != 0) &&
       (list.productName.length != 0) &&
       (list.price.length != 0) &&
       (list.remAmount.length != 0) &&
       (list.regDate.length != 0) &&
       (list.expDate.length != 0) &&
       (list.description.length))
    {
        return true;
    }

    return false;
}

function keyboardBarcodeDetect(e) {

    ipcRenderer.send('app:getProduct', barcodeField.value);
    barcodeField.removeEventListener('change', keyboardBarcodeDetect);
}

ipcRenderer.on("app:response_getProduct", (e, product, succeed) => {
    
    if(succeed) {
        barcodeField.value = product.barcode;
        barcodeField.readOnly = true;
        document.getElementById("barcode").disabled = false;
        document.getElementById("productName").disabled = false;
        document.getElementById("price").disabled = false;
        document.getElementById("remAmount").disabled = false;
        document.getElementById("regDate").disabled = false;
        document.getElementById("expDate").disabled = false;
        document.getElementById("description").disabled = false;

        document.getElementById("productName").value = product.productName;
        document.getElementById("price").value = product.price;
        document.getElementById("remAmount").value = product.remAmount;
        document.getElementById("regDate").value = product.regDate;
        document.getElementById("expDate").value = product.expDate;
        document.getElementById("description").value = product.description;
        barcodeField.focus();
    }
    else {
        document.getElementById("barcode").value = "";
        document.getElementById("productName").value = "";
        document.getElementById("price").value = "";
        document.getElementById("remAmount").value = "";
        document.getElementById("regDate").value = "";
        document.getElementById("expDate").value = "";
        document.getElementById("description").value = "";

        document.getElementById("barcode").disabled = true;
        document.getElementById("productName").disabled = true;
        document.getElementById("price").disabled = true;
        document.getElementById("remAmount").disabled = true;
        document.getElementById("regDate").disabled = true;
        document.getElementById("expDate").disabled = true;
        document.getElementById("description").disabled = true;
        barcodeField.focus();
    }
    
});

//9780857501004