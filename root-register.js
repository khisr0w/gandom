const electron = require('electron');
const {
    ipcRenderer
} = electron;

// Globals for Barcode identification
let prefix = [];
let isPrefixMet = false;
let barcode = ""
let scanForBarcode = false;

const generateCheck = document.getElementById("generate");
const loadBarcode = document.getElementById("load-barcode-btn");
const loadKeyboard = document.getElementById("load-keyboard-btn");

const barcodeLabel = document.getElementById('barcode-label');
const barcodeField = document.getElementById('barcode');

loadKeyboard.addEventListener('click', () => {
    barcodeLabel.style.display = "inline-block";
    barcodeField.style.display = "inline-block";
    barcodeField.readOnly = false;
    barcodeField.value = "";
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

generateCheck.addEventListener('change', () => {
    
    if(generateCheck.checked) {

        loadBarcode.disabled = true;
        loadKeyboard.disabled = true;
        barcodeLabel.style.display = "inline-block";
        barcodeField.style.display = "inline-block";
        barcodeField.readOnly = true;
        
        // Get generated barcode
        ipcRenderer.send("app:getGeneratedBarcode");
    }
    else {

        loadBarcode.disabled = false;
        loadKeyboard.disabled = false;
        barcodeLabel.style.display = "none";
        barcodeField.style.display = "none";
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
        ipcRenderer.send("app:addToDatabase", result);        
    }
});

const clearFields = document.querySelector('#clearfields-btn');
clearFields.addEventListener('click', (e) => {

    e.preventDefault();

    document.getElementById("barcode").value = "";
    document.getElementById("productName").value = "";
    document.getElementById("price").value = "";
    document.getElementById("remAmount").value = "";
    document.getElementById("regDate").value = "";
    document.getElementById("expDate").value = "";
    document.getElementById("description").value = "";

    generateCheck.checked = false;
    loadBarcode.disabled = false;
    loadKeyboard.disabled = false;
    barcodeLabel.style.display = "none";
    barcodeField.style.display = "none";
});

// Responses coming from Main process
ipcRenderer.on("app:response_addToDatabase", (e) => {

});

ipcRenderer.on("app:response_getGeneratedBarcode", (e, barcode) => {
    console.log("InsideRender: "+ barcode);
    barcodeField.readOnly = true;
    barcodeField.value = barcode;

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