const electron = require('electron');
const { ipcRenderer } = electron;
const { dialog } = require('@electron/remote')
const customTitlebar = require('custom-electron-titlebar');

new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#444'),
    icon: '../../../assets/images/Logo.ico'
});

var display = ['Reached start of file!', 'Reached end of file!', 'No data to fetch!'], btnNo;

function prev() {
    btnNo = 0;
    var Code = document.querySelector('#Code').value;
    ipcRenderer.send('office:prev', Code);
}

function nxt() {
    btnNo = 1;
    var Code = document.querySelector('#Code').value;
    if (Code == "") ipcRenderer.send('office:fst');
    else ipcRenderer.send('office:nxt', Code);
}

function fst() {
    btnNo = 2;
    ipcRenderer.send('office:fst');
}

function lst() {
    btnNo = 2;
    ipcRenderer.send('office:lst');
}

ipcRenderer.on('office:getData', (e, arg) => {
    if (arg != null) {
        let arr = ['Code', 'Address'];
        for (let i = 0; i < arr.length; i++) document.querySelector(`#${arr[i]}`).value = arg[arr[i]];
    }
    else {
        dialog.showMessageBox({ type: "warning", message: display[btnNo] });
        window.location.reload();
    }
});

function submit() {
    let obj = {}, arr = ['Code', 'Address'];
    for (let i = 0; i < arr.length; i++) obj[arr[i]] = document.querySelector(`#${arr[i]}`).value;

    if (obj['Address'] == '') dialog.showMessageBox({ type: "error", message: 'Required fields cannot be empty!' })
    else {
        btnSet();
        ipcRenderer.send('office:submit', obj);
    }
}

ipcRenderer.on('office:dataAdded', (event, arg) => {
    if (arg != null) dialog.showMessageBox({ type: "info", message: arg })
    window.location.reload();
});

function btnSet() {
    var btn = document.getElementById('addBtn');
    btn.style.cursor = 'wait';
    btn.disabled = true;
    btn.innerHTML = '...processing...';
    btn.style.background = 'gray';
}

function reload(e) {
    if (e.ctrlKey && e.keyCode == 82) window.location.reload()
}

document.addEventListener('keyup', reload);