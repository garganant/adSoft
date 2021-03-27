const electron = require('electron');
const { ipcRenderer } = electron;
const { shell, dialog } = electron.remote;
const customTitlebar = require('custom-electron-titlebar');

new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#444'),
    icon: '../../../assets/images/Logo.ico'
});

ipcRenderer.send('roCust:get');

ipcRenderer.on('roCust:got', (event, data) => {
    var group = document.querySelector('#input1');
    group.length = 1;
    for (let d of data) {
        var opt = document.createElement("option");
        opt.value = d.dataValues['RoNo'];
        opt.text = d.dataValues['RoNo'] + '|' + formatDate(d.dataValues['RoDate']) + '|' + d.dataValues['VendName'];
        group.append(opt);
    }
    M.FormSelect.init(group);
});

function submit() {
    var e = document.querySelector('#input1');
    var adv = document.querySelector('#input2').value;
    let RoNo = [];
    for (let i = 0; i < e.length; i++) if (e.options[i].selected) RoNo.push(e.options[i].value);
    if (!RoNo.length) dialog.showMessageBox({ type: "error", message: 'No RO selected!' });
    else if (adv == "") dialog.showMessageBox({ type: "error", message: 'Required fields cannot be empty!' });
    else ipcRenderer.send('bill:make', RoNo, adv);
}

ipcRenderer.on('bill:made', (event) => {
    window.location.reload();
});

function formatDate(date) {
    var arr = date.split('-')
    return arr[2] + "-" + arr[1] + "-" + arr[0];
}

function reload(e) {
    if (e.ctrlKey && e.keyCode == 82) window.location.reload();
}

document.addEventListener('keyup', reload);