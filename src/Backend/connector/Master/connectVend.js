const electron = require('electron');
const { ipcRenderer } = electron;
const { dialog } = electron.remote
const customTitlebar = require('custom-electron-titlebar');
var States = require('../../Backend/helper/Master/States.json');

new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#444'),
    icon: '../../../assets/images/Logo.ico'
});

var display = ['Reached start of file!', 'Reached end of file!', 'No data to fetch!', 'No data to fetch!'], btnNo;

M.FormSelect.init(document.querySelector('#Status'));

fillDropdown();

function fillDropdown() {
    var group = document.getElementById('states');
    for (obj of States) {
        var opt = document.createElement("option");
        opt.value = obj.State;
        group.append(opt);
    }
}

function prev() {
    btnNo = 0;
    var Name = document.querySelector('#Name').value;
    ipcRenderer.send('vend:prev', Name);
}

function nxt() {
    btnNo = 1;
    var Name = document.querySelector('#Name').value;
    if (Name == "") ipcRenderer.send('vend:fst');
    else ipcRenderer.send('vend:nxt', Name);
}

function fst() {
    btnNo = 2;
    ipcRenderer.send('vend:fst');
}

function lst() {
    btnNo = 2;
    ipcRenderer.send('vend:lst');
}

function show() {
    btnNo = 3;
    Name = document.querySelector('#Name').value;
    if (Name == "") dialog.showMessageBox({ type: "error", message: 'Please enter a name first!' })
    else ipcRenderer.send('vend:data', Name);
}

ipcRenderer.on('vend:getData', (e, arg) => {
    if (arg != null) {
        let arr = ['id', 'Name', 'Identify', 'Street1', 'Street2', 'City', 'Pincode', 'State', 'ContactPerson', 'ContactNo', 'Gstin', 'Pan'];
        for(let i=0; i<arr.length; i++) document.querySelector(`#${arr[i]}`).value = arg[arr[i]];

        var elems = document.querySelectorAll('select');
        var select = document.getElementById('Status');
        for (var i = 0; i < select.options.length; i++) {
            if (select[i].value == arg.Status) select.options[i].selected = "selected";
        }
        M.FormSelect.init(elems);
    }
    else {
        dialog.showMessageBox({ type: "warning", message: display[btnNo] });
        if(btnNo == 3) window.location.reload();
    }
});

function submit() {
    if (document.querySelector('#input0').files[0] != undefined) {
        const { path } = document.querySelector('#input0').files[0];
        btnSet();
        ipcRenderer.send('vend:submit', path);
    }
    else {
        let arr = ['id', 'Name', 'Identify', 'Street1', 'Street2', 'City', 'Pincode', 'State', 'ContactPerson', 'ContactNo', 'Gstin', 'Pan'];
        let obj = {}, empty = false;
        for (let i = 0; i < arr.length; i++) obj[arr[i]] = document.querySelector(`#${arr[i]}`).value;

        var e = document.getElementById("Status");
        var Status = e.options[e.selectedIndex].value;
        obj['Status'] = Status;
        for ([key, val] of Object.entries(obj)) {
            if (key == 'id' || key == 'Identify') continue;
            else if (key == 'Pincode') obj[key] = (val == "") ? null : parseInt(val);
            else if(val == "") empty = true;
        }
        if (empty) dialog.showMessageBox({ type: "error", message: 'Required fields cannot be empty!' })
        else {
            btnSet();
            ipcRenderer.send('vend:submit', obj);
        }
    }
}

ipcRenderer.on('vend:dataAdded', (event, arg) => {
    if (arg != null) dialog.showMessageBox({ type: "info", message: arg })
    window.location.reload();
});

function prt() {
    ipcRenderer.send('vend:report');
}

ipcRenderer.on('vend:report:made', (event, arg) => {
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
