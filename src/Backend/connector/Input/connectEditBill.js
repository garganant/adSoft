const electron = require('electron');
const { ipcRenderer } = electron;
const { dialog } = electron.remote;
const customTitlebar = require('custom-electron-titlebar');

new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#444'),
    icon: '../../../assets/images/Logo.ico'
});

function show() {
    let bNo = document.querySelector('#BillNo').value;
    if (bNo == "") dialog.showMessageBox({ type: "error", message: 'Please enter a bill no!' });
    else {
        setBtn('showBtn');
        ipcRenderer.send('billData:get', bNo);
    }
}

ipcRenderer.on('billData:got', (event, adv, data) => {
    resetBtn('showBtn');
    let arr = ['Salutation', 'Advance', 'LSplDis', 'Prospect', 'Attention', 'AdRef', 'Product', 'Month', 'Activity'];
    for (let e of arr) document.querySelector(`#${e}`).value = "";
    if (adv != null) {
        document.querySelector('#Advance').value = adv;
        for(let [key, val] of Object.entries(data)) document.querySelector(`#${key}`).value = val;
    }
    else dialog.showMessageBox({ type: "warning", message: 'No data to fetch!' });
});

function submit() {
    let obj = {}, arr = ['BillNo', 'Salutation', 'LSplDis', 'Prospect', 'Attention', 'AdRef', 'Product', 'Month', 'Activity'];
    for(let e of arr) obj[e] = document.querySelector(`#${e}`).value;
    let adv = document.querySelector('#Advance').value;
    if (obj['BillNo'] == "") dialog.showMessageBox({ type: "error", message: 'Please select a bill to continue!' });
    else if (adv == "") dialog.showMessageBox({ type: "error", message: 'Required fields cannot be empty!' });
    else {
        setBtn('editBtn');
        ipcRenderer.send('billData:add', adv, obj);
    }
}

ipcRenderer.on('billData:added', (event, arg) => {
    if(arg != null) dialog.showMessageBox({ type: "info", message: arg });
    window.location.reload();
});

function setBtn(btn) {
    var btn = document.getElementById(btn);
    btn.style.cursor = 'wait';
    btn.disabled = true;
    btn.innerHTML = '...processing...';
    btn.style.background = 'grey';
}

function resetBtn(btn) {
    var btn = document.getElementById(btn);
    btn.style.cursor = 'pointer';
    btn.disabled = false;
    btn.innerHTML = 'Select';
    btn.style.background = '#722620';
}

function reload(e) {
    if (e.ctrlKey && e.keyCode == 82) window.location.reload();
}

document.addEventListener('keyup', reload);