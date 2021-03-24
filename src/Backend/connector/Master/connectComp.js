const electron = require('electron');
const { ipcRenderer } = electron;
const { dialog } = electron.remote;
const customTitlebar = require('custom-electron-titlebar');

new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#444'),
    icon: '../../../assets/images/Logo.ico'
});

ipcRenderer.send('filePath:show');

function select() {
    ipcRenderer.send('select');
}

ipcRenderer.on('selected', (e, arg) => {
    document.querySelector('#input0').value = arg;
})

function show() {
    let Code = document.querySelector('#input1').value;
    if (Code == "") dialog.showMessageBox({ type: "error", message: 'Please enter a code first!' })
    else ipcRenderer.send('comp:data', Code);
}

ipcRenderer.on('comp:get', (e, arg) => {
    if (arg == null) {
        window.location.reload()
        dialog.showMessageBox({ type: "error", message: 'Incorrect company code!' })
    }
    else {
        let arr = ['Code', 'Name', 'Address', 'Phone', 'Mobile', 'Fax', 'Email', 'Website', 'TradeDis', 'Pan', 'Gstin', 'Cin', 'CGst', 'SGst', 'IGst', 'Spl1', 'Spl2'];
        for (let i = 1; i <= 17; i++) document.querySelector(`#input${i}`).value = arg[arr[i-1]];
    }
});

function addData() {
    let arr = {};
    let obj = ['Code', 'Name', 'Address', 'Phone', 'Mobile', 'Fax', 'Email', 'Website', 'TradeDis', 'Pan', 'Gstin', 'Cin', 'CGst', 'SGst', 'IGst', 'Spl1', 'Spl2'];
    for (let i = 1; i <= 17; i++) arr[obj[i-1]] = document.querySelector(`#input${i}`).value;
    let a = ['Code', 'Name', 'TradeDis', 'CGst', 'SGst', 'IGst'], empty = false;
    for(let i of a) if(arr[i] == "") empty = true;
    if (empty) dialog.showMessageBox({ type: "error", message: 'Required fields cannot be empty' });
    else ipcRenderer.send('comp:submit', arr);
}

ipcRenderer.on('comp:submitted', (e, arg) => {
    dialog.showMessageBox({ type: "info", message: arg })
    window.location.reload();
});

reload = (e) => {
    if (e.ctrlKey && e.keyCode == 82) window.location.reload();
}

document.addEventListener('keyup', reload);
