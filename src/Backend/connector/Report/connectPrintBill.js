const electron = require('electron');
const { ipcRenderer } = electron;
const { dialog } = require('@electron/remote');
const customTitlebar = require('custom-electron-titlebar');

new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#444'),
    icon: '../../../assets/images/Logo.ico'
});

M.AutoInit();

function prt() {
    let start = document.querySelector('#from').value;
    if (start == "") dialog.showMessageBox({ type: "error", message: "Required fields cannot be empty!" });
    else {
        let end = document.querySelector('#to').value;
        let e = document.querySelector('#BType');
        let btype = e.options[e.selectedIndex].value;
        if(end == "") end = start;
        setBtn();
        ipcRenderer.send('bill:prt', start, end, btype);
    }
}

ipcRenderer.on('bill:prted', (event) => {
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