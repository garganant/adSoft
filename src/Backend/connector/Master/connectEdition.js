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
    var Code = document.querySelector('#input1').value;
    ipcRenderer.send('edition:prev', Code);
}

function nxt() {
    btnNo = 1;
    var Code = document.querySelector('#input1').value;
    if (Code == "") ipcRenderer.send('edition:fst');
    else ipcRenderer.send('edition:nxt', Code);
}

function fst() {
    btnNo = 2;
    ipcRenderer.send('edition:fst');
}

function lst() {
    btnNo = 2;
    ipcRenderer.send('edition:lst');
}

function show() {
    btnNo = 2;
    Code = document.querySelector('#input1').value;
    if (Code == "") dialog.showMessageBox({ type: "error", message: 'Please enter a code first!' })
    else ipcRenderer.send('edition:data', Code);
}

ipcRenderer.on('edition:getData', (e, arg) => {
    if (arg != null) {
        let arr = ['Code', 'CityName'];
        for (let i = 1; i <= arr.length; i++) document.querySelector(`#input${i}`).value = arg[arr[i - 1]];
    }
    else {
        dialog.showMessageBox({ type: "warning", message: display[btnNo] });
        window.location.reload();
    }
});

function submit() {
    if (document.querySelector('#input0').files[0] != undefined) {
        const { path } = document.querySelector('#input0').files[0];
        btnSet();
        ipcRenderer.send('edition:submit', path);
    }
    else {
        let arr = [];
        for (let i = 1; i <= 2; i++) arr.push(document.querySelector(`#input${i}`).value);

        if (arr[0] == "" || arr[1] == "") dialog.showMessageBox({ type: "error", message: 'Required fields cannot be empty!' })
        else {
            btnSet();
            ipcRenderer.send('edition:submit', arr);
        }
    }
}

ipcRenderer.on('edition:dataAdded', (event, arg) => {
    if (arg != null) dialog.showMessageBox({ type: "info", message: arg })
    window.location.reload();
});

function prt() {
    ipcRenderer.send('edition:report');
}

ipcRenderer.on('edition:report:made', (event, arg) => {
    dialog.showMessageBox({ type: "info", message: arg })
});

function btnSet() {
    var btn = document.getElementById('addBtn');
    btn.style.cursor = 'wait';
    btn.disabled = true;
    btn.innerHTML = '...processing...';
    btn.style.background = 'grey';
}

function reload(e) {
    if (e.ctrlKey && e.keyCode == 82) window.location.reload()
}

document.addEventListener('keyup', reload);