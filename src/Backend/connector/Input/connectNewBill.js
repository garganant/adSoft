const electron = require('electron');
const { ipcRenderer } = electron;
const { dialog } = electron.remote;
const customTitlebar = require('custom-electron-titlebar');

new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#444'),
    icon: '../../../assets/images/Logo.ico'
});

M.AutoInit();

ipcRenderer.send('roCust:get');

ipcRenderer.on('roCust:got', (event, data) => {
    var group = document.querySelector('#RoNo');
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
    let obj = {}, arr = ['Advance', 'LSplDis', 'Prospect', 'Attention', 'Product', 'Month', 'Activity', 'AdRef'];
    for(let ele of arr) obj[ele] = document.querySelector(`#${ele}`).value;
    let e = document.querySelector('#BType');
    let btype = e.options[e.selectedIndex].value;
    e = document.querySelector('#RoNo');
    let RoNo = [];
    for (let i = 0; i < e.length; i++) if (e.options[i].selected) RoNo.push(e.options[i].value);
    if (!RoNo.length) dialog.showMessageBox({ type: "error", message: 'No RO selected!' });
    else if (obj['Advance'] == "") dialog.showMessageBox({ type: "error", message: 'Required fields cannot be empty!' });
    else {
        setBtn('addBtn');
        ipcRenderer.send('bill:make', RoNo, obj, btype);
    }
}

ipcRenderer.on('bill:made', (event) => {
    window.location.reload();
});

function setBtn(btn) {
    var btn = document.getElementById(btn);
    btn.style.cursor = 'wait';
    btn.disabled = true;
    btn.innerHTML = '...processing...';
    btn.style.background = 'grey';
}

function formatDate(date) {
    var arr = date.split('-')
    return arr[2] + "-" + arr[1] + "-" + arr[0];
}

function reload(e) {
    if (e.ctrlKey && e.keyCode == 82) window.location.reload();
}

document.addEventListener('keyup', reload);