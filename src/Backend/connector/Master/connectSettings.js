const electron = require('electron');
const { ipcRenderer } = electron;
const { dialog } = electron.remote;
const customTitlebar = require('custom-electron-titlebar');

new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#444'),
    icon: '../../../assets/images/Logo.ico'
});

ipcRenderer.send('compPath:show');

function select() {
    ipcRenderer.send('select');
}

ipcRenderer.on('selected', (e, arg) => {
    if(arg != null) {
        document.querySelector('#input1').value = arg.Spl1;
        document.querySelector('#input2').value = arg.Spl2;
        document.querySelector('#input0').value = arg.File_path;
    }
});

function addData() {
    let arr = {}, obj = ['Spl1', 'Spl2'];
    for (let i = 1; i <= obj.length; i++) arr[obj[i - 1]] = document.querySelector(`#input${i}`).value;
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