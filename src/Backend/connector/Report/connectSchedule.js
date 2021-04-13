const electron = require('electron');
const { ipcRenderer } = electron;
const { shell, dialog } = require('@electron/remote');
const customTitlebar = require('custom-electron-titlebar');

new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#444'),
    icon: '../../../assets/images/Logo.ico'
});

function prt() {
    let from = document.querySelector('#from').value;
    let to = document.querySelector('#to').value;

    if (from == "" || to == "") dialog.showMessageBox({ type: "error", message: "Required fields cannot be empty!" });
    else {
        setBtn();
        ipcRenderer.send('schedule:prt', from, to);
    }
}

ipcRenderer.on('schedule:prted', (event, path) => {
    if (path != null) shell.openPath(path);
    window.location.reload();
});

function setBtn() {
    var btn = document.getElementById('prtBtn');
    btn.style.cursor = 'wait';
    btn.disabled = true;
    btn.innerHTML = '...processing...';
    btn.style.background = 'grey';
}

function reload(e) {
    if (e.ctrlKey && e.keyCode == 82) window.location.reload();
}

document.addEventListener('keyup', reload);