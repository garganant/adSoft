const electron = require('electron');
const { ipcRenderer } = electron;
const { dialog } = electron.remote
const customTitlebar = require('custom-electron-titlebar');

new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#444'),
    icon: '../../../assets/images/Logo.ico'
});

var editionList = [], same = {}, diff = {}, btnNo;
var messages = ['Reached start of file!', 'Reached end of file!', 'No data to fetch!'];
let table = document.getElementById('dataTable');

document.addEventListener('DOMContentLoaded', function () {
    M.AutoInit();
    ipcRenderer.send('getNewRO');
    ipcRenderer.send('getVend');
    ipcRenderer.send('getGroupCode');
    ipcRenderer.send('getSubject');
    ipcRenderer.send('edition:get');
});

ipcRenderer.on('newRO:got', (e, RoNo, cData) => {
    document.querySelector('#input1').value = RoNo;
    let d = new Date();
    document.querySelector('#roDate').value = d.toLocaleDateString('en-CA');
    document.querySelector('#input5').value = cData.dataValues.TradeDis;
    document.querySelector('#input8').value = cData.dataValues.Spl1;
    document.querySelector('#input9').value = cData.dataValues.Spl2;
});
ipcRenderer.on('vendDetails:got', (e, vendName) => fillDropdown('customers', vendName, 'Name', '') );
ipcRenderer.on('groupCode:got', (e, group_code) => fillDropdown('input3', group_code, 'Code', 'GroupName') );
ipcRenderer.on('subjectDetails:got', (e, subject) => fillDropdown('input4', subject, 'Code', 'SubjectDetail') );
ipcRenderer.on('edition:got', (e, data) => editionList = data);

function fillDropdown(fieldId, data, val, txt) {
    var group = document.getElementById(fieldId);
    group.length = 1;
    for (i in data) {
        var opt = document.createElement("option");
        opt.value = data[i][val];
        if (txt !== '') opt.text = data[i][txt];
        group.append(opt);
    }
    if (txt !== '') M.FormSelect.init(group);
}

function addNewRow() {
    var e = document.getElementById("input3");
    var grpCode = e.options[e.selectedIndex].value;
    if (grpCode == "") dialog.showMessageBox({ type: "error", message: 'Please select newspaper group first!' });
    else ipcRenderer.send('getPapers', grpCode);
}

ipcRenderer.on('papers:got', (e, paperNames) => {
    let table = document.getElementById('dataTable');
    let obj = {'Caption': '', 'DateP': '', 'RateCR': '', 'RatePR': '', 'Width': '', 'Height': ''};
    fillTable(table.rows.length, paperNames, obj);
});

var group = document.getElementById('input3');
group.addEventListener('change', () => {
    let table = document.getElementById('dataTable');
    while (table.rows.length > 1) table.deleteRow(1);
});

// BUTTONS ////////////////////////////////////////////

function prev() {
    btnNo = 0;
    var No = document.querySelector('#input1').value;
    if (No == "" || No == 1) dialog.showMessageBox({ type: "warning", message: 'Reached start of file!' });
    else ipcRenderer.send('roData:get', parseInt(No)-1);
}

function nxt() {
    btnNo = 1;
    var No = document.querySelector('#input1').value;
    No = (No == "") ? 1 : parseInt(No) + 1;
    ipcRenderer.send('roData:get', No);
}

function fst() {
    btnNo = 2;
    ipcRenderer.send('roData:get', 1);
}

function lst() {
    btnNo = 2;
    ipcRenderer.send('roData:get', '');
}

function show() {
    btnNo = 2;
    const No = document.querySelector('#input1').value;
    if (No == "") dialog.showMessageBox({ type: "error", message: 'Please enter a RO number first!' });
    else ipcRenderer.send('roData:get', No);
}

ipcRenderer.on('roData:got', (event, arg, arg2) => {
    if (Object.keys(arg).length) {
        same = arg, diff = arg2;
        fillFields(arg, arg2);
    }
    else {
        dialog.showMessageBox({ type: "warning", message: messages[btnNo] });
        if(btnNo == 2) window.location.reload();
    }
});

function fillFields(arg, arg2) {
    document.querySelector('#input1').value = arg.RoNo;
    document.querySelector('#input2').value = arg.VendName;
    document.querySelector('#input5').value = arg.TradeDis;
    document.querySelector('#input6').value = arg.SplDis;
    document.querySelector('#input7').value = arg.Position;
    document.querySelector('#input8').value = arg.Spl1;
    document.querySelector('#input9').value = arg.Spl2;
    document.querySelector('#roDate').value = arg.RoDate;
    selectDropdown(document.querySelector('#input3'), arg.GroupCode);
    selectDropdown(document.querySelector('#input4'), arg.SubjectCode);

    var table = document.getElementById("dataTable");
    for (let i = table.rows.length - 1; i >= 1; i--) table.deleteRow(i);
    for(let i=1; i<=arg2.length; i++) {
        fillTable(i, arg.paperNames, arg2[i-1]);
        var currRow = table.rows[i];
        selectDropdown(currRow.cells[0].childNodes[0], arg2[i-1].ShortName);
        selectDropdown(currRow.cells[1].childNodes[0], arg2[i - 1].EditionCode);
        cRpR();
    }
}

function selectDropdown(select, val) {
    select.options[0].selected = "selected";
    for (var i = 0; i < select.options.length; i++) {
        if (select.options[i].value == val) {
            select.options[i].selected = "selected";
            break;
        }
    }
    M.FormSelect.init(select);
}

function submit() {
    var same = {}, diffD = [], roNum = document.querySelector('#input1').value;
    same['RoNo'] = roNum;
    same['VendName'] = document.querySelector('#input2').value;
    let e = document.querySelector('#input3');
    same['GroupCode'] = e.options[e.selectedIndex].value;
    e = document.querySelector('#input4');
    same['SubjectCode'] = e.options[e.selectedIndex].value;
    same['TradeDis'] = document.querySelector('#input5').value;
    same['SplDis'] = document.querySelector('#input6').value;
    same['Position'] = document.querySelector('#input7').value;
    same['Spl1'] = document.querySelector('#input8').value;
    same['Spl2'] = document.querySelector('#input9').value;

    var table = document.getElementById("dataTable");
    for(let i=1; i<table.rows.length; i++) {
        let tableD = {};
        tableD['RoNo'] = roNum;
        let row = table.rows[i];
        let e = row.cells[0].childNodes[0];
        tableD['ShortName'] = e.options[e.selectedIndex].value;
        e = row.cells[1].childNodes[0];
        tableD['EditionCode'] = e.options[e.selectedIndex].value;

        let arr = ['Caption', 'DateP', 'RateCR', 'RatePR', 'Width', 'Height'];
        for (let j = 2; j <= 7; j++) tableD[arr[j - 2]] = row.cells[j].childNodes[0].value;
        diffD.push(tableD);
    }

    let empty = false;
    for([key, val] of Object.entries(same)) {
        if(key === 'Spl1' || key === 'Spl2') continue;
        if(val == "") empty = true;
    }
    for(let obj of diffD) {
        for ([key, val] of Object.entries(obj)) if (val == "") empty = true;
    }
    
    if (!diffD.length) dialog.showMessageBox({ type: "error", message: 'Empty RO cannot be created!' });
    else if (empty) dialog.showMessageBox({ type: "error", message: 'Required fields cannot be empty!' });
    else ipcRenderer.send('addEditRO', same, diffD);
}

ipcRenderer.on('roData:saved', (event, arg) => {
    dialog.showMessageBox({ type: "info", message: arg });
    window.location.reload();
});

function fillTable(idx, paperNames, arr) {
    let table = document.getElementById('dataTable');
    let row = table.insertRow(idx);

    let newspaper = row.insertCell(0);
    let edition = row.insertCell(1);
    let caption = row.insertCell(2);
    let pdate = row.insertCell(3);
    let cr = row.insertCell(4);
    let pr = row.insertCell(5);
    let width = row.insertCell(6);
    let height = row.insertCell(7);
    row.insertCell(8);
    row.insertCell(9);
    let remove = row.insertCell(10);

    fillSelect(newspaper, paperNames, 'ShortName', 'ShortName');
    fillSelect(edition, editionList, 'CityName', 'Code');
    M.AutoInit();
    createInput(caption, 'text', '', arr['Caption']);
    createInput(pdate, 'date', '', arr['DateP']);
    createInput(cr, 'number', '.01', arr['RateCR']);
    createInput(pr, 'number', '.01', arr['RatePR']);
    createInput(width, 'number', '1', arr['Width']);
    createInput(height, 'number', '', arr['Height']);
    removeBtn(remove, row.rowIndex);
}

function fillSelect(col, data, txt, val) {
    let tBox = document.createElement('select');
    tBox.setAttribute('class', 'browser-default');
    for (let ele of data) {
        var opt = document.createElement("option");
        opt.text = ele[txt];
        opt.value = ele[val];
        tBox.appendChild(opt);
    }
    col.appendChild(tBox);
}

function createInput(col, inputType, decimals, txt) {
    let tBox = document.createElement('input');
    tBox.setAttribute('type', inputType);
    tBox.style.margin = 0;
    if (inputType === 'number' && decimals !== '') tBox.setAttribute('step', decimals);
    else if (inputType === 'text') tBox.setAttribute('maxlength', '25');
    else if(inputType === 'date') {
        let d = new Date();
        d.setDate(d.getDate() + 1);
        tBox.value = d.toLocaleDateString('en-CA');
    }
    if(txt != '') tBox.value = txt;
    col.appendChild(tBox);
}

function removeBtn(remove, idx) {
    let outer = document.createElement('a');
    let inner = document.createElement('i');
    outer.setAttribute('class', 'btn-floating btn-small waves-effect waves-light red');
    outer.setAttribute('id', idx);
    outer.setAttribute('onClick', 'removeRow(this)');
    inner.setAttribute('class', 'material-icons');
    inner.innerHTML = 'remove';
    outer.appendChild(inner);
    remove.appendChild(outer);
    var elems = document.querySelectorAll('.tooltipped');
    M.Tooltip.init(elems);
}

function removeRow(e) {
    let table = document.getElementById('dataTable');
    for (let i = 1; i < table.rows.length; i++) {
        if (table.rows[i].childNodes[10].childNodes[0].id == e['id']) {
            table.deleteRow(i);
            break;
        }
    }
}

table.addEventListener('change', () => cRpR());

function cRpR() {
    for(let r=1; r<table.rows.length; r++) {
        let currRow = table.rows[r];
        let cr = currRow.cells[4].childNodes[0].value;
        let pr = currRow.cells[5].childNodes[0].value;
        let w = currRow.cells[6].childNodes[0].value;
        let h = currRow.cells[7].childNodes[0].value;
        currRow.cells[8].innerHTML = cr * w * h;
        currRow.cells[9].innerHTML = pr * w * h;
    }
}

function prt() {
    var No = document.querySelector('#input1').value;
    if (No == "" || !Object.keys(same).length) dialog.showMessageBox({ type: "error", message: 'First search a RO to print!' });
    else ipcRenderer.send('ro:prt', No);
}

function reload(e) {
    if (e.ctrlKey && e.keyCode == 82) window.location.reload()
}

document.addEventListener('keyup', reload);