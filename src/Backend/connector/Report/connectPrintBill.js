const electron = require('electron');
const { ipcRenderer } = electron;
const { dialog } = electron.remote;
const customTitlebar = require('custom-electron-titlebar');

new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#444'),
    icon: '../../../assets/images/Logo.ico'
});

M.AutoInit();

function prt() {
    let s = document.querySelector('#from').value;
    if(s == "") dialog.showMessageBox({ type: "error", message: "Required fields cannot be empty!" });
    else {
        let e = document.querySelector('#to').value;
        let e = document.querySelector('#BType');
        let btype = e.options[e.selectedIndex].value;
        if(e == "") e = s;
        ipcRenderer.send('bill:prt', s, e, btype);
    }
}

ipcRenderer.on('bill:prted', (event) => {
    window.location.reload();
});

function reload(e) {
    if (e.ctrlKey && e.keyCode == 82) window.location.reload();
}

document.addEventListener('keyup', reload);