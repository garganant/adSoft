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
    let PbType = "", bStatus = "";
    var ele = document.getElementsByName('PbType');
    for (i = 0; i < ele.length; i++) if (ele[i].checked) PbType = ele[i].value;

    ele = document.getElementsByName('bStatus');
    for (i = 0; i < ele.length; i++) if (ele[i].checked) bStatus = ele[i].value;

    if (from == "" || to == "" || PbType == "" || bStatus == "") dialog.showMessageBox({ type: "error", message: "Required fields cannot be empty!" });
    else {
        setBtn();
        ipcRenderer.send('billReport:prt', from, to, PbType, bStatus);
    }
}

ipcRenderer.on('billReport:prted', (event, path) => {
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