const path = require('path');
require('electron-reload')(process.cwd(), { electron: path.join(process.cwd(), 'node_modules', '.bin', 'electron.cmd') })
const { app, BrowserWindow, Menu, ipcMain, dialog, screen } = require('electron')
const { Sequelize } = require('sequelize')
var fs = require('fs');
const Op = Sequelize.Op;
var Excel = require('exceljs');
var win;

if (require('electron-squirrel-startup')) return;

function createWindow() {
    // Create the browser window.
    const { width, height } = screen.getPrimaryDisplay().workAreaSize
    win = new BrowserWindow({
        webPreferences: { nodeIntegration: true, enableRemoteModule: true, webSecurity: true, contextIsolation: false },
        width, height, frame: false,
        backgroundColor: '#F2BC94'
    });

    win.loadFile('./src/Frontend/basePage.html');
    const { menuTemplate } = require('./src/Backend/Populate/menu.js');
    menuTemplate();
}

// This method will be called when Electron has finished initialization and is ready to create browser windows. Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') { app.quit() }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) { createWindow() }
})


// Code starts here ///////////////////////////////////////////////////////////

const sequelize = require('./src/Backend/database/connection.js');

function showError(err) {
    const messageBoxOptions = { type: "error", title: "Process cancelled!", message: err };
    dialog.showMessageBox(messageBoxOptions);
}

// MASTER /////////////////////////////////////////////////////////////////////

// VENDOR //////////////////////////////////////////////////

ipcMain.on('vend:prev', async (e, name) => {
    const Vend = require('./src/Backend/models/Master/Vendor.js');
    var data = await Vend.findOne({ where: { Name: { [Op.lt]: name } }, order: [['Name', 'DESC']] })
    if (data != null) win.webContents.send('vend:getData', data.dataValues);
    else win.webContents.send('vend:getData', null);
});

ipcMain.on('vend:nxt', async (event, name) => {
    const Vend = require('./src/Backend/models/Master/Vendor.js');
    var data = await Vend.findOne({ where: { Name: { [Op.gt]: name } } })
    if (data != null) win.webContents.send('vend:getData', data.dataValues);
    else win.webContents.send('vend:getData', null);
});

ipcMain.on('vend:fst', async (event) => {
    const Vend = require('./src/Backend/models/Master/Vendor.js');
    var data = await Vend.findOne({order: ['Name']});
    if (data != null) win.webContents.send('vend:getData', data.dataValues);
    else win.webContents.send('vend:getData', null);
});

ipcMain.on('vend:lst', async (event) => {
    const Vend = require('./src/Backend/models/Master/Vendor.js');
    var data = await Vend.findOne({ order: [['Name', 'DESC']] })
    if (data != null) win.webContents.send('vend:getData', data.dataValues);
    else win.webContents.send('vend:getData', null);
});

ipcMain.on('vend:data', async (event, name) => {
    const Vend = require('./src/Backend/models/Master/Vendor.js')
    var data = await Vend.findOne({ where: { Name: { [Op.like]: `%${name}%`} } });
    if (data != null) win.webContents.send('vend:getData', data.dataValues);
    else win.webContents.send('vend:getData', null);
});

ipcMain.on('vend:submit', async (event, arg) => {
    const Vend = require('./src/Backend/models/Master/Vendor.js');
    try {
        if (typeof arg == 'object') {
            const [user, created] = await  Vend.findOrCreate({
                where: { Name: arg[0] },
                defaults: {
                    Address: arg[1],
                    ContactPerson: arg[2],
                    ContactNo: arg[3],
                    Gstin: arg[4],
                    Pan: arg[5],
                    Status: arg[6]
                }
            });
            if (created) win.webContents.send('vend:dataAdded', 'Data added to vend master!');
            else {
                await Vend.update({
                    Address: arg[1],
                    ContactPerson: arg[2],
                    ContactNo: arg[3],
                    Gstin: arg[4],
                    Pan: arg[5],
                    Status: arg[6]
                }, { where: { Name: arg[0] } });
                win.webContents.send('vend:dataAdded', 'Data updated!');
            }
        }
        else {
            var arr = [];
            const workbook = new Excel.Workbook();
            workbook.xlsx.readFile(arg).then(async function () {
                var worksheet = workbook.getWorksheet('Sheet1');
                worksheet.eachRow({ includeEmpty: true }, function (currRow, rowNumber) {
                    let row = currRow.values;
                    let empty = false, ok = true;
                    for (let i = 1; i <= 7; i++) if (i != 6 && row[i] == null) empty = true;
                    if (rowNumber == 1 || empty || row[5].length > 15 || (row[6] != null && row[6].length > 10) || row[7].length > 1) ok = false;
                    var obj = { Name: row[1], Address: row[2], ContactPerson: row[3], ContactNo: row[4], Gstin: row[5], Pan: row[6], Status: row[7] };
                    if(ok) arr.push(obj);
                });
                await Vend.bulkCreate(arr, {
                    updateOnDuplicate: ["Address", "ContactPerson", "ContactNo", "Gstin", "Pan", "Status"]
                });
            });
            win.webContents.send('vend:dataAdded', 'Data added to vend master!');
        }
    } catch (err) {
        showError(err.stack)
        win.webContents.send('vend:dataAdded', null);
    }
});

ipcMain.on('vend:report', async (event) => {
    const Vend = require('./src/Backend/models/Master/Vendor.js');
    var data = await Vend.findAll();
    var arr = [];
    for (let i in data) arr.push(data[i].dataValues);

    const { createExcelVend } = require('./src/Backend/helper/Master/VendExcel.js');

    var c = await dialog.showSaveDialog({ filters: [{ name: '', extensions: ['xlsx', 'xls'] }] });;
    if (c.canceled == false) {
        await createExcelVend(arr, c.filePath);
        win.webContents.send('vend:report:made', 'Excel report created!');
    }
    else win.webContents.send('vend:report:made', 'Process cancelled!');
});

// GROUP ///////////////////////////////////

ipcMain.on('group:prev', async (e, code) => {
    const PaperGroups = require('./src/Backend/models/Master/PaperGroups.js');
    var data = await PaperGroups.findOne({ where: { Code: { [Op.lt]: code } }, order: [['Code', 'DESC']] });
    if (data != null) win.webContents.send('group:getData', data.dataValues);
    else win.webContents.send('group:getData', null);
});

ipcMain.on('group:nxt', async (event, code) => {
    const PaperGroups = require('./src/Backend/models/Master/PaperGroups.js');
    var data = await PaperGroups.findOne({ where: { Code: { [Op.gt]: code } } });
    if (data != null) win.webContents.send('group:getData', data.dataValues);
    else win.webContents.send('group:getData', null);
});

ipcMain.on('group:fst', async (event) => {
    const PaperGroups = require('./src/Backend/models/Master/PaperGroups.js');
    var data = await PaperGroups.findOne({ order: ['Code'] });
    if (data != null) win.webContents.send('group:getData', data.dataValues);
    else win.webContents.send('group:getData', null);
});

ipcMain.on('group:lst', async (event) => {
    const PaperGroups = require('./src/Backend/models/Master/PaperGroups.js');
    var data = await PaperGroups.findOne({ order: [['Code', 'DESC']] });
    if (data != null) win.webContents.send('group:getData', data.dataValues);
    else win.webContents.send('group:getData', null);
});

ipcMain.on('group:data', async (event, code) => {
    const PaperGroups = require('./src/Backend/models/Master/PaperGroups.js')
    var data = await PaperGroups.findOne({ where: { Code: code } });
    if (data != null) win.webContents.send('group:getData', data.dataValues);
    else win.webContents.send('group:getData', null);
});

ipcMain.on('group:submit', async (event, arg) => {
    const PaperGroups = require('./src/Backend/models/Master/PaperGroups.js');
    try {
        if (typeof arg == 'object') {
            const [user, created] = await PaperGroups.findOrCreate({
                where: { Code: arg[0] },
                defaults: {
                    GroupName: arg[1],
                    HoLoc: arg[2]
                }
            });
            if (created) win.webContents.send('group:dataAdded', 'Data added to group master!');
            else {
                await PaperGroups.update({
                    GroupName: arg[1],
                    HoLoc: arg[2]
                }, { where: { Code: arg[0] } });
                win.webContents.send('group:dataAdded', 'Data updated!');
            }
        }
        else {
            var arr = [];
            const workbook = new Excel.Workbook();
            workbook.xlsx.readFile(arg).then(async function () {
                var worksheet = workbook.getWorksheet('Sheet1');
                worksheet.eachRow({ includeEmpty: true }, function (currRow, rowNumber) {
                    let row = currRow.values;
                    let empty = false, ok = true;
                    for (let i = 1; i <= 3; i++) if (row[i] == null) empty = true;
                    if (rowNumber == 1 || empty || row[1].length > 6 || row[2].length > 30 || row[2].length > 25) ok = false;
                    var obj = { Code: row[1], GroupName: row[2], HoLoc: row[3] };
                    if (ok) arr.push(obj);
                });
                await PaperGroups.bulkCreate(arr, {
                    updateOnDuplicate: ["GroupName", "HoLoc"]
                });
            });
            win.webContents.send('group:dataAdded', 'Data added to group master!');
        }
    } catch (err) {
        showError(err.stack)
        win.webContents.send('group:dataAdded', null);
    }
});

ipcMain.on('group:report', async (event) => {
    const PaperGroups = require('./src/Backend/models/Master/PaperGroups.js');
    var data = await PaperGroups.findAll();
    var arr = [];
    for (let i in data) arr.push(data[i].dataValues);

    const { createExcelGroup } = require('./src/Backend/helper/Master/GroupExcel.js');

    var c = await dialog.showSaveDialog({ filters: [{ name: '', extensions: ['xlsx', 'xls'] }] });;
    if (c.canceled == false) {
        await createExcelGroup(arr, c.filePath);
        win.webContents.send('group:report:made', 'Excel report created!');
    }
    else win.webContents.send('group:report:made', 'Process cancelled!');
});

// NEWSPAPER ////////////////////////////////////////////

ipcMain.on('getGroupCode', async (event) => {
    const { groupDetails } = require('./src/Backend/helper/Functions.js');
    win.webContents.send('groupCode:got', await groupDetails());
});

ipcMain.on('newspaper:prev', async (e, ShortName) => {
    const Newspaper = require('./src/Backend/models/Master/Newspaper.js');
    var data = await Newspaper.findOne({ where: { ShortName: { [Op.lt]: ShortName } }, order: [['ShortName', 'DESC']] });
    if (data != null) win.webContents.send('newspaper:getData', data.dataValues);
    else win.webContents.send('newspaper:getData', null);
});

ipcMain.on('newspaper:nxt', async (event, ShortName) => {
    const Newspaper = require('./src/Backend/models/Master/Newspaper.js');
    var data = await Newspaper.findOne({ where: { ShortName: { [Op.gt]: ShortName } } });
    if (data != null) win.webContents.send('newspaper:getData', data.dataValues);
    else win.webContents.send('newspaper:getData', null);
});

ipcMain.on('newspaper:fst', async (event) => {
    const Newspaper = require('./src/Backend/models/Master/Newspaper.js');
    var data = await Newspaper.findOne({ order: ['ShortName'] });
    if (data != null) win.webContents.send('newspaper:getData', data.dataValues);
    else win.webContents.send('newspaper:getData', null);
});

ipcMain.on('newspaper:lst', async (event) => {
    const Newspaper = require('./src/Backend/models/Master/Newspaper.js');
    var data = await Newspaper.findOne({ order: [['ShortName', 'DESC']] });
    if (data != null) win.webContents.send('newspaper:getData', data.dataValues);
    else win.webContents.send('newspaper:getData', null);
});

ipcMain.on('newspaper:data', async (event, ShortName) => {
    const Newspaper = require('./src/Backend/models/Master/Newspaper.js')
    var data = await Newspaper.findOne({ where: { ShortName: ShortName } });
    if (data != null) win.webContents.send('newspaper:getData', data.dataValues);
    else win.webContents.send('newspaper:getData', null);
});

ipcMain.on('newspaper:submit', async (event, arg) => {
    const Newspaper = require('./src/Backend/models/Master/Newspaper.js');
    try {
        if (typeof arg == 'object') {
            const [user, created] = await Newspaper.findOrCreate({
                where: { ShortName: arg[0] },
                defaults: {
                    PaperName: arg[1],
                    GroupCode: arg[2]
                }
            });
            if (created) win.webContents.send('newspaper:dataAdded', 'Data added to newspaper master!');
            else {
                await Newspaper.update({
                    PaperName: arg[1],
                    GroupCode: arg[2]
                }, { where: { ShortName: arg[0] } });
                win.webContents.send('newspaper:dataAdded', 'Data updated!');
            }
        }
        else {
            var arr = [];
            const workbook = new Excel.Workbook();
            workbook.xlsx.readFile(arg).then(async function () {
                var worksheet = workbook.getWorksheet('Sheet1');
                worksheet.eachRow({ includeEmpty: true }, function (currRow, rowNumber) {
                    let row = currRow.values;
                    let empty = false, ok = true;
                    for (let i = 1; i <= 3; i++) if (row[i] == null) empty = true;
                    if (rowNumber == 1 || empty || row[1].length > 5 || row[2].length > 25 || row[3].length > 6) ok = false;
                    var obj = { ShortName: row[1], PaperName: row[2], GroupCode: row[3] };
                    if (ok) arr.push(obj);
                });
                await Newspaper.bulkCreate(arr, {
                    updateOnDuplicate: ["PaperName", "GroupCode"]
                });
            });
            win.webContents.send('newspaper:dataAdded', 'Data added to newspaper master!');
        }
    } catch (err) {
        showError(err.stack)
        win.webContents.send('newspaper:dataAdded', null);
    }
});

ipcMain.on('newspaper:report', async (event) => {
    const Newspaper = require('./src/Backend/models/Master/Newspaper.js');
    var data = await Newspaper.findAll();
    var arr = [];
    for (let i in data) arr.push(data[i].dataValues);

    const { createExcelNewspaper } = require('./src/Backend/helper/Master/NewspaperExcel.js');

    var c = await dialog.showSaveDialog({ filters: [{ name: '', extensions: ['xlsx', 'xls'] }] });;
    if (c.canceled == false) {
        await createExcelNewspaper(arr, c.filePath);
        win.webContents.send('newspaper:report:made', 'Excel report created!');
    }
    else win.webContents.send('newspaper:report:made', 'Process cancelled!');
});

// EDITION /////////////////////////////////////

ipcMain.on('edition:prev', async (e, code) => {
    const Edition = require('./src/Backend/models/Master/Edition.js');
    var data = await Edition.findOne({ where: { Code: { [Op.lt]: code } }, order: [['Code', 'DESC']] });
    if (data != null) win.webContents.send('edition:getData', data.dataValues);
    else win.webContents.send('edition:getData', null);
});

ipcMain.on('edition:nxt', async (event, code) => {
    const Edition = require('./src/Backend/models/Master/Edition.js');
    var data = await Edition.findOne({ where: { Code: { [Op.gt]: code } } });
    if (data != null) win.webContents.send('edition:getData', data.dataValues);
    else win.webContents.send('edition:getData', null);
});

ipcMain.on('edition:fst', async (event) => {
    const Edition = require('./src/Backend/models/Master/Edition.js');
    var data = await Edition.findOne({ order: ['Code'] });
    if (data != null) win.webContents.send('edition:getData', data.dataValues);
    else win.webContents.send('edition:getData', null);
});

ipcMain.on('edition:lst', async (event) => {
    const Edition = require('./src/Backend/models/Master/Edition.js');
    var data = await Edition.findOne({ order: [['Code', 'DESC']] });
    if (data != null) win.webContents.send('edition:getData', data.dataValues);
    else win.webContents.send('edition:getData', null);
});

ipcMain.on('edition:data', async (event, code) => {
    const Edition = require('./src/Backend/models/Master/Edition.js')
    var data = await Edition.findOne({ where: { Code: code } });
    if (data != null) win.webContents.send('edition:getData', data.dataValues);
    else win.webContents.send('edition:getData', null);
});

ipcMain.on('edition:submit', async (event, arg) => {
    const Edition = require('./src/Backend/models/Master/Edition.js');
    try {
        if (typeof arg == 'object') {
            const [user, created] = await Edition.findOrCreate({
                where: { Code: arg[0] },
                defaults: {
                    CityName: arg[1]
                }
            });
            if (created) win.webContents.send('edition:dataAdded', 'Data added to edition master!');
            else {
                await Edition.update({
                    CityName: arg[1]
                }, { where: { Code: arg[0] } });
                win.webContents.send('edition:dataAdded', 'Data updated!');
            }
        }
        else {
            var arr = [];
            const workbook = new Excel.Workbook();
            workbook.xlsx.readFile(arg).then(async function () {
                var worksheet = workbook.getWorksheet('Sheet1');
                worksheet.eachRow({ includeEmpty: true }, function (currRow, rowNumber) {
                    let row = currRow.values;
                    let empty = false, ok = true;
                    for (let i = 1; i <= 2; i++) if (row[i] == null) empty = true;
                    if (rowNumber == 1 || empty || row[1].length > 5 || row[2].length > 25) ok = false;
                    var obj = { Code: row[1], CityName: row[2] };
                    if (ok) arr.push(obj);
                });
                await Edition.bulkCreate(arr, {
                    updateOnDuplicate: ["CityName"]
                });
            });
            win.webContents.send('edition:dataAdded', 'Data added to edition master!');
        }
    } catch (err) {
        showError(err.stack)
        win.webContents.send('edition:dataAdded', null);
    }
});

ipcMain.on('edition:report', async (event) => {
    const Edition = require('./src/Backend/models/Master/Edition.js');
    var data = await Edition.findAll();
    var arr = [];
    for (let i in data) arr.push(data[i].dataValues);

    const { createExcelEdition } = require('./src/Backend/helper/Master/EditionExcel.js');

    var c = await dialog.showSaveDialog({ filters: [{ name: '', extensions: ['xlsx', 'xls'] }] });;
    if (c.canceled == false) {
        await createExcelEdition(arr, c.filePath);
        win.webContents.send('edition:report:made', 'Excel report created!');
    }
    else win.webContents.send('edition:report:made', 'Process cancelled!');
});

// SUBJECT ////////////////////////////////////////

ipcMain.on('subject:prev', async (e, code) => {
    const Subject = require('./src/Backend/models/Master/Subject.js');
    var data = await Subject.findOne({ where: { Code: { [Op.lt]: code } }, order: [['Code', 'DESC']] });
    if (data != null) win.webContents.send('subject:getData', data.dataValues);
    else win.webContents.send('subject:getData', null);
});

ipcMain.on('subject:nxt', async (event, code) => {
    const Subject = require('./src/Backend/models/Master/Subject.js');
    var data = await Subject.findOne({ where: { Code: { [Op.gt]: code } } });
    if (data != null) win.webContents.send('subject:getData', data.dataValues);
    else win.webContents.send('subject:getData', null);
});

ipcMain.on('subject:fst', async (event) => {
    const Subject = require('./src/Backend/models/Master/Subject.js');
    var data = await Subject.findOne({ order: ['Code'] });
    if (data != null) win.webContents.send('subject:getData', data.dataValues);
    else win.webContents.send('subject:getData', null);
});

ipcMain.on('subject:lst', async (event) => {
    const Subject = require('./src/Backend/models/Master/Subject.js');
    var data = await Subject.findOne({ order: [['Code', 'DESC']] });
    if (data != null) win.webContents.send('subject:getData', data.dataValues);
    else win.webContents.send('subject:getData', null);
});

ipcMain.on('subject:data', async (event, code) => {
    const Subject = require('./src/Backend/models/Master/Subject.js')
    var data = await Subject.findOne({ where: { Code: code } });
    if (data != null) win.webContents.send('subject:getData', data.dataValues);
    else win.webContents.send('subject:getData', null);
});

ipcMain.on('subject:submit', async (event, arg) => {
    const Subject = require('./src/Backend/models/Master/Subject.js');
    try {
        if (typeof arg == 'object') {
            const [user, created] = await Subject.findOrCreate({
                where: { Code: arg[0] },
                defaults: {
                    SubjectDetail: arg[1]
                }
            });
            if (created) win.webContents.send('subject:dataAdded', 'Data added to subject master!');
            else {
                await Subject.update({
                    SubjectDetail: arg[1]
                }, { where: { Code: arg[0] } });
                win.webContents.send('subject:dataAdded', 'Data updated!');
            }
        }
        else {
            var arr = [];
            const workbook = new Excel.Workbook();
            workbook.xlsx.readFile(arg).then(async function () {
                var worksheet = workbook.getWorksheet('Sheet1');
                worksheet.eachRow({ includeEmpty: true }, function (currRow, rowNumber) {
                    let row = currRow.values;
                    let empty = false, ok = true;
                    for (let i = 1; i <= 2; i++) if (row[i] == null) empty = true;
                    if (rowNumber == 1 || empty || row[1].length > 2 || row[2].length > 40) ok = false;
                    var obj = { Code: row[1], SubjectDetail: row[2] };
                    if (ok) arr.push(obj);
                });
                await Subject.bulkCreate(arr, {
                    updateOnDuplicate: ["SubjectDetail"]
                });
            });
            win.webContents.send('subject:dataAdded', 'Data added to subject master!');
        }
    } catch (err) {
        showError(err.stack)
        win.webContents.send('subject:dataAdded', null);
    }
});

ipcMain.on('subject:report', async (event) => {
    const Subject = require('./src/Backend/models/Master/Subject.js');
    var data = await Subject.findAll();
    var arr = [];
    for (let i in data) arr.push(data[i].dataValues);

    const { createExcelSubject } = require('./src/Backend/helper/Master/SubjectExcel.js');

    var c = await dialog.showSaveDialog({ filters: [{ name: '', extensions: ['xlsx', 'xls'] }] });;
    if (c.canceled == false) {
        await createExcelSubject(arr, c.filePath);
        win.webContents.send('subject:report:made', 'Excel report created!');
    }
    else win.webContents.send('subject:report:made', 'Process cancelled!');
});

// COMPANY ///////////////////////////////////////////

ipcMain.on('filePath:show', async (event) => {
    const Comp = require('./src/Backend/models/Master/Comp.js');
    var c = await Comp.findOne({ attributes: ['File_path'] });
    if (c != null) win.webContents.send('selected', c.dataValues.File_path);
    else win.webContents.send('selected', "");
});

ipcMain.on('comp:data', async (event, arg) => {
    const Comp = require('./src/Backend/models/Master/Comp.js');
    var data = await Comp.findOne({ where: { Code: arg } });
    if (data != null) win.webContents.send('comp:get', data.dataValues);
    else win.webContents.send('comp:get', null);
});

ipcMain.on('comp:submit', async (event, arg) => {
    const Comp = require('./src/Backend/models/Master/Comp.js');
    var count = await Comp.count({ where: { Code: arg.Code } });
    var message = "Entry not found!";
    if (count) {
        var result = await Comp.update(arg, { where: { Code: arg.Code } });
        message = (result[0] == 1) ? 'Entry updated!' : 'No updations!';
    }
    win.webContents.send('comp:submitted', message);
});

ipcMain.on('select', async (event) => {
    const Comp = require('./src/Backend/models/Master/Comp.js');
    var path = await dialog.showOpenDialog({ properties: ['openDirectory'] });
    if (!path.canceled) {
        await Comp.findOne({ attributes: ['Code'] }).then(async (userResult) => {
            await Comp.update({ File_path: path.filePaths + '\\' }, { where: { Code: { [Op.ne]: null } } });
        });
    }
    var c = await Comp.findOne({ attributes: ['File_path'] });
    win.webContents.send('selected', c.dataValues.File_path);
});

// INPUT ///////////////////////////////////////////////////////////////

// RO /////////////////////////////////////////////

ipcMain.on('getNewRO', async (event) => {
    const RoSame = require('./src/Backend/models/Input/RoSame.js');
    const Comp = require('./src/Backend/models/Master/Comp.js');

    var data = await RoSame.findOne({attributes: ['RoNo'], order: [['RoNo', 'DESC']]});
    var cData = await Comp.findOne({ attributes: ['TradeDis', 'Spl1', 'Spl2'] });
    let RoNo = 1;
    if(data != null) RoNo = data.dataValues.RoNo + 1;
    win.webContents.send('newRO:got', RoNo, cData);
});

ipcMain.on('getVend', async (event) => {
    const { vendDetails } = require('./src/Backend/helper/Functions.js');
    win.webContents.send('vendDetails:got', await vendDetails());
});

ipcMain.on('getSubject', async (event) => {
    const { subjectDetails } = require('./src/Backend/helper/Functions.js');
    win.webContents.send('subjectDetails:got', await subjectDetails());
});

ipcMain.on('getPapers', async (event, grpCode) => {
    const { newspaperNames } = require('./src/Backend/helper/Functions.js');
    win.webContents.send('papers:got', await newspaperNames(grpCode));
});

ipcMain.on('edition:get', async (event) => {
    const { editionList } = require('./src/Backend/helper/Functions.js');
    win.webContents.send('edition:got', await editionList());
});

ipcMain.on('roData:get', async (event, arg) => {
    const { roData } = require('./src/Backend/helper/Input/RoFunc.js');
    const RoSame = require('./src/Backend/models/Input/RoSame.js');
    if(arg == '') {
        let data = await RoSame.findOne({attributes: ['RoNo'], order: [['RoNo', 'DESC']]});
        if(data != null) arg = data.dataValues.RoNo;
    }
    var arr = await roData(arg);
    win.webContents.send('roData:got', arr[0], arr[1]);
});

ipcMain.on('addEditRO', async (event, same, diff) => {
    const { addEditRO } = require('./src/Backend/helper/Input/RoFunc.js');
    win.webContents.send('roData:saved', await addEditRO(same, diff));
});

ipcMain.on('ro:prt', async (event, sameD, diffD) => {
    const Comp = require('./src/Backend/models/Master/Comp.js');
    const PaperGroups = require('./src/Backend/models/Master/PaperGroups.js');
    const Subject = require('./src/Backend/models/Master/Subject.js');
    const Newspaper = require('./src/Backend/models/Master/Newspaper.js');
    const Edition = require('./src/Backend/models/Master/Edition.js');
    const { createRo } = require('./src/Backend/helper/Input/createRo.js');
    const { createRoExcel } = require('./src/Backend/helper/Input/createRoExcel.js');
    
    var cData = await Comp.findOne();
    var gData = await PaperGroups.findOne({ where: {Code: sameD.GroupCode} });
    sameD['GroupName'] = gData.dataValues.GroupName;
    sameD['HoLoc'] = gData.dataValues.HoLoc;
    sameD['SubjectDetail'] = (await Subject.findOne({ attributes: ['SubjectDetail'], where: { Code: sameD.SubjectCode } })).dataValues.SubjectDetail;

    var papers = await Newspaper.findAll({ attributes: ['ShortName', 'PaperName'], where: {GroupCode: sameD.GroupCode} });
    var cities = await Edition.findAll();
    let paperMap = {}, cityMap = {};
    for (let ele of papers) paperMap[ele.dataValues['ShortName']] = ele.dataValues['PaperName'];
    for(let ele of cities) cityMap[ele.dataValues['Code']] = ele.dataValues['CityName'];

    let signStamp = path.join(__dirname, 'assets/images/signStamp.png');
    createRo(sameD, diffD, cData.dataValues, paperMap, cityMap, signStamp);
    let pt = cData.dataValues.File_path + 'Print.xlsx';
    createRoExcel(sameD, diffD, paperMap, cityMap, pt);

    win.webContents.send('ro:prted', pt);
});