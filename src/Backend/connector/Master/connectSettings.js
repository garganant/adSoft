const electron = require('electron');
const { ipcRenderer } = electron;
const { dialog } = require('@electron/remote');
const customTitlebar = require('custom-electron-titlebar');

new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#444'),
    icon: '../../../assets/images/Logo.ico'
});

ipcRenderer.send('compDetail:show');

function select() {
    ipcRenderer.send('select');
}

ipcRenderer.on('selected', (e, arg) => {
    if(arg != null) {
        let arr = ['Spl1', 'Spl2', 'Bank', 'Branch', 'BCName', 'AccNo', 'Ifsc'];
        for(let ele of arr) document.querySelector(`#${ele}`).value = arg[ele];
        document.querySelector('#input0').value = arg.File_path;
    }
});

function addData() {
    let arr = {}, obj = ['Spl1', 'Spl2', 'Bank', 'Branch', 'BCName', 'AccNo', 'Ifsc'];
    for (let ele of obj) arr[ele] = document.querySelector(`#${ele}`).value;
    ipcRenderer.send('settings:submit', arr);
}

ipcRenderer.on('settings:submitted', (e) => {
    dialog.showMessageBox({ type: "info", message: 'Changes saved!' })
    window.location.reload();
});

reload = (e) => {
    if (e.ctrlKey && e.keyCode == 82) window.location.reload();
}

document.addEventListener('keyup', reload);