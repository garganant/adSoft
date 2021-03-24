const electron = require('electron');
const { ipcRenderer } = electron;
const { dialog } = electron.remote
const customTitlebar = require('custom-electron-titlebar');

new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#444'),
    icon: '../../../assets/images/Logo.ico'
});

var display = ['Reached start of file!', 'Reached end of file!', 'No data to fetch!', 'No data to fetch!'], btnNo;

M.FormSelect.init(document.querySelector('#input7'));

function prev() {
    btnNo = 0;
    var Name = document.querySelector('#input1').value;
    ipcRenderer.send('vend:prev', Name);
}

function nxt() {
    btnNo = 1;
    var Name = document.querySelector('#input1').value;
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
    Name = document.querySelector('#input1').value;
    if (Name == "") dialog.showMessageBox({ type: "error", message: 'Please enter a name first!' })
    else ipcRenderer.send('vend:data', Name);
}

ipcRenderer.on('vend:getData', (e, arg) => {
    console.log(arg);
    if (arg != null) {
        let arr = ['Name', 'Address', 'ContactPerson', 'ContactNo', 'Gstin', 'Pan'];
        for(let i=1; i<=6; i++) document.querySelector(`#input${i}`).value = arg[arr[i-1]];

        var elems = document.querySelectorAll('select');
        var select = document.getElementById('input7');
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
        let arr = [], empty = false;
        for (let i = 1; i <= 6; i++) arr.push(document.querySelector(`#input${i}`).value);

        var e = document.getElementById("input7");
        var Status = e.options[e.selectedIndex].value;
        arr.push(Status);
        
        for(let i of arr) if(i == "") empty = true;
        if (empty) dialog.showMessageBox({ type: "error", message: 'Required fields cannot be empty!' })
        else {
            btnSet();
            ipcRenderer.send('vend:submit', arr);
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
