const electron = require('electron');
const { ipcRenderer } = electron;
const { shell, dialog } = electron.remote;
const customTitlebar = require('custom-electron-titlebar');

new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#444'),
    icon: '../../../assets/images/Logo.ico'
});

var editionList = [], btnNo, same_d, diff_d, vendObj = {};
var messages = ['Reached start of file!', 'Reached end of file!', 'No data to fetch!'];
let table = document.getElementById('dataTable');

table.addEventListener('change', () => widthHeight());
document.querySelector('#AdType').addEventListener('click', () => widthHeight());

document.addEventListener('DOMContentLoaded', function () {
    M.AutoInit();
    ipcRenderer.send('getNewRO');
    ipcRenderer.send('getVend');
    ipcRenderer.send('getGroupCode');
    ipcRenderer.send('getSubject');
    ipcRenderer.send('edition:get');
});

ipcRenderer.on('newRO:got', (e, RoNo, cData) => {
    document.querySelector('#RoNo').value = RoNo;
    let d = new Date();
    document.querySelector('#RoDate').value = d.toLocaleDateString('en-CA');
    document.querySelector('#TradeDis').value = cData.dataValues.TradeDis;
    document.querySelector('#Spl1').value = cData.dataValues.Spl1;
    document.querySelector('#Spl2').value = cData.dataValues.Spl2;
});
ipcRenderer.on('vendDetails:got', (e, vendName) => {
    fillDropdown('customers', vendName, 'Name', 'Identify', 'id');
});
ipcRenderer.on('groupCode:got', (e, group_code) => fillDropdown('Group', group_code, 'Code', 'GroupName', '') );
ipcRenderer.on('subjectDetails:got', (e, subject) => fillDropdown('Subject', subject, 'Code', 'SubjectDetail', '') );
ipcRenderer.on('edition:got', (e, data) => editionList = data);

function fillDropdown(fieldId, data, val, txt, id) {
    var group = document.getElementById(fieldId);
    group.length = 1;
    for (let ele of data) {
        var opt = document.createElement("option");
        opt.value = ele[val];
        if (fieldId === 'customers') {
            opt.id = ele[id];
            if(ele[txt] != '') opt.value+= ' ~ ' + ele[txt];
            vendObj[ele[val] + ele[txt]] = ele[id];
        }
        else opt.text = ele[txt];
        group.append(opt);
    }
    if (fieldId !== 'customers') M.FormSelect.init(group);
}

function addNewRow() {
    var e = document.getElementById("Group");
    var grpCode = e.options[e.selectedIndex].value;
    if (grpCode == "") dialog.showMessageBox({ type: "error", message: 'Please select newspaper group first!' });
    else ipcRenderer.send('getPapers', grpCode);
}

ipcRenderer.on('papers:got', (e, paperNames) => {
    let table = document.getElementById('dataTable');
    let obj = {'SubE': '', 'Caption': '', 'DateP': '', 'RateCR': '', 'RatePR': '', 'Width': '', 'Height': ''};
    fillTable(table.rows.length, paperNames, obj);
});

var group = document.getElementById('Group');
group.addEventListener('change', () => {
    let table = document.getElementById('dataTable');
    while (table.rows.length > 1) table.deleteRow(1);
});

// BUTTONS ////////////////////////////////////////////

function prev() {
    btnNo = 0;
    var No = document.querySelector('#RoNo').value;
    if (No == "" || No == 1) dialog.showMessageBox({ type: "warning", message: 'Reached start of file!' });
    else ipcRenderer.send('roData:get', parseInt(No)-1, 'p');
}

function nxt() {
    btnNo = 1;
    var No = document.querySelector('#RoNo').value;
    No = (No == "") ? 1 : parseInt(No) + 1;
    ipcRenderer.send('roData:get', No, 'n');
}

function fst() {
    btnNo = 2;
    ipcRenderer.send('roData:get', '', 'f');
}

function lst() {
    btnNo = 2;
    ipcRenderer.send('roData:get', '', 'l');
}

function show() {
    btnNo = 2;
    const No = document.querySelector('#RoNo').value;
    if (No == "") dialog.showMessageBox({ type: "error", message: 'Please enter a RO number first!' });
    else ipcRenderer.send('roData:get', No, 's');
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
    let arr = ['RoNo', 'RoDate', 'VendName', 'TradeDis', 'SplDis', 'Position', 'RConfirm', 'Spl1', 'Package', 'Spl2', 'TParty'];
    for (let i = 0; i<arr.length; i++) document.querySelector(`#${arr[i]}`).value = arg[arr[i]];

    document.querySelector('#AdType').checked = arg['AdType'] == 'D' ? false : true;
    selectDropdown(document.querySelector('#Group'), arg.GroupCode);
    selectDropdown(document.querySelector('#Subject'), arg.SubjectCode);

    var table = document.getElementById("dataTable");
    for (let i = table.rows.length - 1; i >= 1; i--) table.deleteRow(i);
    for(let i=1; i<=arg2.length; i++) {
        fillTable(i, arg.paperNames, arg2[i-1]);
        var currRow = table.rows[i];
        selectDropdown(currRow.cells[0].childNodes[0], arg2[i-1].ShortName);
        selectDropdown(currRow.cells[1].childNodes[0], arg2[i - 1].EditionCode);
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

async function submit() {
    let ans = await dialog.showMessageBox({ type: "warning", buttons: ["Yes", "No"], message: "Do you want to save the changes?" });
    if (ans.response) return false;

    let arr = ['RoNo', 'RoDate', 'RoDate', 'TradeDis', 'SplDis', 'Position', 'RConfirm', 'Spl1', 'Package', 'Spl2', 'TParty', 'RConfirm'];
    var same = {}, diffD = [], roNum = document.querySelector('#RoNo').value;
    for (let i = 0; i < arr.length; i++) same[arr[i]] = document.querySelector(`#${arr[i]}`).value;

    let cName = document.querySelector('#VendName').value.split('~');
    let d = cName.length > 1 ? cName[0].trim() + cName[1].trim() : cName[0];
    same['VendName'] = cName[0];    // Used only for printing
    same['VendCode'] = vendObj[d];
    same['AdType'] = document.querySelector('#AdType').checked ? 'C' : 'D';
    let e = document.querySelector('#Group');
    same['GroupCode'] = e.options[e.selectedIndex].value;
    e = document.querySelector('#Subject');
    same['SubjectCode'] = e.options[e.selectedIndex].value;

    var table = document.getElementById("dataTable");
    for(let i=1; i<table.rows.length; i++) {
        let tableD = {};
        tableD['RoNo'] = roNum;
        let row = table.rows[i];
        let e = row.cells[0].childNodes[0];
        tableD['ShortName'] = e.options[e.selectedIndex].value;
        e = row.cells[1].childNodes[0];
        tableD['EditionCode'] = e.options[e.selectedIndex].value;

        let arr = ['SubE', 'Caption', 'DateP', 'RateCR', 'RatePR', 'Width', 'Height'];
        for (let j = 2; j <= 8; j++) tableD[arr[j - 2]] = row.cells[j].childNodes[0].value;
        diffD.push(tableD);
    }

    let empty = false;
    for([key, val] of Object.entries(same)) {
        if (key === 'Spl1' || key == 'Package' || key === 'Spl2' || key === 'TParty') continue;
        if(val == "") empty = true;
    }
    for(let obj of diffD) {
        for ([key, val] of Object.entries(obj)) if (val == "" && key != 'SubE') empty = true;
    }
    same_d = same, diff_d = diffD;
    if (!diffD.length) dialog.showMessageBox({ type: "error", message: 'Empty RO cannot be created!' });
    else if (vendObj[d] === undefined) dialog.showMessageBox({ type: "error", message: 'Customer does not exist.' });
    else if (empty) dialog.showMessageBox({ type: "error", message: 'Required fields cannot be empty!' });
    else ipcRenderer.send('addEditRO', same, diffD);

    return true;
}

ipcRenderer.on('roData:saved', (event, arg) => {
    if(arg != null) dialog.showMessageBox({ type: "info", message: arg });
    window.location.reload();
});

function fillTable(idx, paperNames, arr) {
    let table = document.getElementById('dataTable');
    let row = table.insertRow(idx);

    let newspaper = row.insertCell(0);
    let edition = row.insertCell(1);
    let subE = row.insertCell(2);
    let caption = row.insertCell(3);
    let pdate = row.insertCell(4);
    let cr = row.insertCell(5);
    let pr = row.insertCell(6);
    let width = row.insertCell(7);
    let height = row.insertCell(8);
    row.insertCell(9);
    row.insertCell(10);
    let remove = row.insertCell(11);
    remove.style = "border: hidden; border-left: inherit;";

    fillSelect(newspaper, paperNames, 'ShortName', 'ShortName');
    fillSelect(edition, editionList, 'CityName', 'Code');
    M.AutoInit();
    createInput(subE, 'text', '', arr['SubE'], '25');
    createInput(caption, 'text', '', arr['Caption'], '15');
    createInput(pdate, 'date', '', arr['DateP'], '');
    createInput(cr, 'number', '.01', arr['RateCR'], '');
    createInput(pr, 'number', '.01', arr['RatePR'], '');
    createInput(width, 'number', '1', arr['Width'], '');
    createInput(height, 'number', '', arr['Height'], '');
    removeBtn(remove, row.rowIndex);
    widthHeight();
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

function createInput(col, inputType, decimals, txt, mLen) {
    let tBox = document.createElement('input');
    tBox.setAttribute('type', inputType);
    tBox.style.margin = 0;
    if (inputType === 'number' && decimals !== '') tBox.setAttribute('step', decimals);
    else if (inputType === 'text') tBox.setAttribute('maxlength', mLen);
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

function widthHeight() {
    let checked = document.querySelector('#AdType').checked;
    table.rows[0].cells[7].innerHTML = checked ? 'LINES' : 'WIDTH';
    table.rows[0].cells[8].innerHTML = checked ? '' : 'HEIGHT';
    for (let i = 1; i < table.rows.length; i++) {
        let curr = table.rows[i];
        curr.cells[8].childNodes[0].disabled = checked ? true : false;
        if(checked) {
            curr.cells[8].childNodes[0].value = 0;
            curr.cells[9].innerHTML = table.rows[i].cells[5].childNodes[0].value;
            curr.cells[10].innerHTML = table.rows[i].cells[6].childNodes[0].value;
        }
        else {
            let cr = curr.cells[5].childNodes[0].value;
            let pr = curr.cells[6].childNodes[0].value;
            let w = curr.cells[7].childNodes[0].value;
            let h = curr.cells[8].childNodes[0].value;
            curr.cells[9].innerHTML = cr * w * h;
            curr.cells[10].innerHTML = pr * w * h;
        }
    }
}

function removeRow(e) {
    let table = document.getElementById('dataTable');
    for (let i = 1; i < table.rows.length; i++) {
        if (table.rows[i].childNodes[11].childNodes[0].id == e['id']) {
            table.deleteRow(i);
            break;
        }
    }
}

async function prt() {
    let res = await submit();
    if(res) {
        let empty = false;
        for ([key, val] of Object.entries(same_d)) {
            if (key === 'Spl1' || key === 'Spl2' || key === 'TParty' || key === 'Package') continue;
            if (val == "") empty = true;
        }
        for (let obj of diff_d) {
            for ([key, val] of Object.entries(obj)) if (val == "" && key != 'SubE') empty = true;
        }
        if (diff_d.length && !empty) ipcRenderer.send('ro:prt', same_d, diff_d);
    }
}

ipcRenderer.on('ro:prted', (event, path) => {
    if (path != null) shell.openPath(path);
});

function reload(e) {
    if (e.ctrlKey && e.keyCode == 82) window.location.reload();
}

document.addEventListener('keyup', reload);