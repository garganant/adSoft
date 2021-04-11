const electron = require('electron');
const { ipcRenderer } = electron;
const { dialog } = require('@electron/remote')
const customTitlebar = require('custom-electron-titlebar');

new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#444'),
    icon: '../../../assets/images/Logo.ico'
});

var display = ['Reached start of file!', 'Reached end of file!', 'No data to fetch!'], btnNo;

ipcRenderer.send('getGroupCode');

ipcRenderer.on('groupCode:got', (e, group_code) => {
    var group = document.getElementById('input3');
    group.length = 1;
    for (i in group_code) {
        var opt = document.createElement("option");
        opt.value = group_code[i].Code;
        opt.text = group_code[i].GroupName;
        group.append(opt);
    }
    M.FormSelect.init(group);
});

function prev() {
    btnNo = 0;
    var short = document.querySelector('#input1').value;
    ipcRenderer.send('newspaper:prev', short);
}

function nxt() {
    btnNo = 1;
    var short = document.querySelector('#input1').value;
    if (short == "") ipcRenderer.send('newspaper:fst');
    else ipcRenderer.send('newspaper:nxt', short);
}

function fst() {
    btnNo = 2;
    ipcRenderer.send('newspaper:fst');
}

function lst() {
    btnNo = 2;
    ipcRenderer.send('newspaper:lst');
}

function show() {
    btnNo = 2;
    let short = document.querySelector('#input1').value;
    if (short == "") dialog.showMessageBox({ type: "error", message: 'Please enter a code first!' })
    else ipcRenderer.send('newspaper:data', short);
}

ipcRenderer.on('newspaper:getData', (e, arg) => {
    if (arg != null) {
        let arr = ['ShortName', 'PaperName', 'GroupCode'];
        for (let i = 1; i < arr.length; i++) document.querySelector(`#input${i}`).value = arg[arr[i-1]];
        var elems = document.querySelectorAll('select');
        var select = document.getElementById('input3');
        select.options[0].selected = "selected";
        for (var i = 0; i < select.options.length; i++) {
            if (select.options[i].value == arg.GroupCode) {
                select.options[i].selected = "selected";
                break;
            }
        }
        M.FormSelect.init(elems);
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
        ipcRenderer.send('newspaper:submit', path);
    }
    else {
        let arr = [], empty = false;
        for(let i=1; i<=2; i++) arr.push(document.querySelector(`#input${i}`).value);
        var e = document.getElementById("input3");
        var short = e.options[e.selectedIndex].value;
        arr.push(short);

        for (let i = 1; i <= 3; i++) if(arr[i] == "") empty = true;
        if (empty) dialog.showMessageBox({ type: "error", message: 'Required fields cannot be empty!' })
        else {
            btnSet();
            ipcRenderer.send('newspaper:submit', arr);
        }
    }
}

ipcRenderer.on('newspaper:dataAdded', (event, arg) => {
    if (arg != null) dialog.showMessageBox({ type: "info", message: arg })
    window.location.reload();
});

function prt() {
    ipcRenderer.send('newspaper:report');
}

ipcRenderer.on('newspaper:report:made', (event, arg) => {
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