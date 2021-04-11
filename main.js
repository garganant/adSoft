const path = require('path');
require('electron-reload')(process.cwd(), { electron: path.join(process.cwd(), 'node_modules', '.bin', 'electron.cmd') })
const { app, BrowserWindow, Menu, ipcMain, dialog, screen } = require('electron')
const { Sequelize } = require('sequelize');
require('@electron/remote/main').initialize();
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
        backgroundColor: '#00BFFF'
    });

    win.loadFile('./src/Frontend/basePage.html');
    const { menuTemplate } = require('./src/Backend/Populate/menu.js');
    menuTemplate();
}


// This method will be called when Electron has finished initialization and is ready to create browser windows. Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

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

require('./src/Backend/database/connection.js');

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
                where: { id: arg.id },
                defaults: {
                    Name: arg.Name,
                    Identify: arg.Identify,
                    Street1: arg.Street1,
                    Street2: arg.Street2,
                    City: arg.City,
                    Pincode: arg.Pincode,
                    State: arg.State,
                    ContactPerson: arg.ContactPerson,
                    ContactNo: arg.ContactNo,
                    Gstin: arg.Gstin,
                    Pan: arg.Pan,
                    Status: arg.Status
                }
            });
            if (created) win.webContents.send('vend:dataAdded', 'Data added to vend master!');
            else {
                await Vend.update(arg, { where: { id: arg.id } });
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
                    if (rowNumber != 1 && row[2] != null && row[4] != null && row[5] != null && row[6] != null && row[7] != null && row[8] != null && (row[13] != 'L' || row[13] != 'C')) {
                        var obj = {
                            id: row[1],
                            Name: row[2].toString().trim(),
                            Identify: row[3] != null ? row[3].toString().trim().substring(0, 15) : '',
                            Street1: row[4] != null ? row[4].toString().trim().substring(0, 40) : '',
                            Street2: row[5] != null ? row[5].toString().trim().substring(0, 40) : '',
                            City: row[6] != null ? row[6].toString().trim().substring(0, 40) : '',
                            Pincode: row[7] != null ? row[7].toString().trim().substring(0, 6) : '',
                            State: row[8] != null ? row[8].toString().trim().substring(0, 40) : '',
                            ContactPerson: row[9].toString().trim(),
                            ContactNo: row[10].toString().trim(),
                            Gstin: row[11] != null ? row[11].toString().trim().substring(0, 15) : '',
                            Pan: row[12] != null ? row[12].toString().trim().substring(0, 10) : '',
                            Status: row[13].toString().trim()
                        };
                        arr.push(obj);
                    }
                });
                await Vend.bulkCreate(arr, {
                    updateOnDuplicate: ["Name", "Identify", "Street1", "Street2", "City", "Pincode", "State", "ContactPerson", "ContactNo", "Gstin", "Pan", "Status"]
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
                    var obj = {
                        Code: row[1] != null ? row[1].toString().trim().substring(0, 6) : '',
                        GroupName: row[2] != null ? row[2].toString().trim().substring(0, 30) : '',
                        HoLoc: row[3] != null ? row[3].toString().trim().substring(0, 25) : ''
                    };
                    if(ok) arr.push(obj);
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
                    var obj = {
                        ShortName: row[1] != null ? row[1].toString().trim().substring(0, 5) : '',
                        PaperName: row[2] != null ? row[2].toString().trim().substring(0, 25) : '',
                        GroupCode: row[3] != null ? row[3].toString().trim().substring(0, 6) : ''
                    };
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
                    var obj = {
                        Code: row[1] != null ? row[1].toString().trim().substring(0, 5) : '',
                        CityName: row[2] != null ? row[2].toString().trim().substring(0, 25) : ''
                    };
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
                    var obj = {
                        Code: row[1],
                        SubjectDetail: row[2] != null ? row[2].toString().trim().substring(0, 40) : ''
                    };
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

// OFFICE //////////////////////////////////////////////////////

ipcMain.on('office:prev', async (e, code) => {
    const Office = require('./src/Backend/models/Master/Office.js');
    var data = await Office.findOne({ where: { Code: { [Op.lt]: code } }, order: [['Code', 'DESC']] });
    if (data != null) win.webContents.send('office:getData', data.dataValues);
    else win.webContents.send('office:getData', null);
});

ipcMain.on('office:nxt', async (event, code) => {
    const Office = require('./src/Backend/models/Master/Office.js');
    var data = await Office.findOne({ where: { Code: { [Op.gt]: code } } });
    if (data != null) win.webContents.send('office:getData', data.dataValues);
    else win.webContents.send('office:getData', null);
});

ipcMain.on('office:fst', async (event) => {
    const Office = require('./src/Backend/models/Master/Office.js');
    var data = await Office.findOne({ order: ['Code'] });
    if (data != null) win.webContents.send('office:getData', data.dataValues);
    else win.webContents.send('office:getData', null);
});

ipcMain.on('office:lst', async (event) => {
    const Office = require('./src/Backend/models/Master/Office.js');
    var data = await Office.findOne({ order: [['Code', 'DESC']] });
    if (data != null) win.webContents.send('office:getData', data.dataValues);
    else win.webContents.send('office:getData', null);
});

ipcMain.on('office:data', async (event, code) => {
    const Office = require('./src/Backend/models/Master/Office.js')
    var data = await Office.findOne({ where: { Code: code } });
    if (data != null) win.webContents.send('office:getData', data.dataValues);
    else win.webContents.send('office:getData', null);
});

ipcMain.on('office:submit', async (event, arg) => {
    const Office = require('./src/Backend/models/Master/Office.js');
    try {
        const [user, created] = await Office.findOrCreate({
            where: { Code: arg['Code'] },
            defaults: {
                Address: arg['Address']
            }
        });
        if (created) win.webContents.send('office:dataAdded', 'Data added to office master!');
        else {
            await Office.update({
                Address: arg['Address']
            }, { where: { Code: arg['Code'] } });
            win.webContents.send('office:dataAdded', 'Data updated!');
        }
    } catch (err) {
        showError(err.stack)
        win.webContents.send('office:dataAdded', null);
    }
});

// COMPANY ///////////////////////////////////////////

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

// SETTINGS //////////////////////////////////////////////////

ipcMain.on('compDetail:show', async (event) => {
    const Comp = require('./src/Backend/models/Master/Comp.js');
    var c = await Comp.findOne({ attributes: ['File_path', 'Spl1', 'Spl2', 'BCName', 'AccNo', 'Ifsc', 'Bank' , 'Branch'] });
    if (c != null) win.webContents.send('selected', c.dataValues);
    else win.webContents.send('selected', null);
});

ipcMain.on('select', async (event) => {
    const Comp = require('./src/Backend/models/Master/Comp.js');
    var path = await dialog.showOpenDialog({ properties: ['openDirectory'] });
    if (!path.canceled) {
        await Comp.findOne({ attributes: ['Code'] }).then(async (userResult) => {
            await Comp.update({ File_path: path.filePaths + '\\' }, { where: { Code: { [Op.ne]: null } } });
        });
    }
    var c = await Comp.findOne({ attributes: ['File_path', 'Spl1', 'Spl2', 'BCName', 'AccNo', 'Ifsc', 'Bank', 'Branch'] });
    win.webContents.send('selected', c.dataValues);
});

ipcMain.on('settings:submit', async(event, arg) => {
    try {
        const Comp = require('./src/Backend/models/Master/Comp.js');
        await Comp.update(arg, { where: { Code: {[Op.ne]: null} } });
        win.webContents.send('settings:submitted');
    }
    catch (err) {
        showError(err.stack)
        win.webContents.send('settings:submitted');
    }
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
    win.webContents.send('newRO:got', RoNo, cData.dataValues);
});

ipcMain.on('getVend', async (event) => {
    const { vendDetails } = require('./src/Backend/helper/Functions.js');
    win.webContents.send('vendDetails:got', await vendDetails());
});

ipcMain.on('getSubject', async (event) => {
    const { subjectDetails } = require('./src/Backend/helper/Functions.js');
    win.webContents.send('subjectDetails:got', await subjectDetails());
});

ipcMain.on('office:get', async (event) => {
    const { officeDetails } = require('./src/Backend/helper/Functions.js');
    win.webContents.send('office:got', await officeDetails());
});

ipcMain.on('getPapers', async (event, grpCode) => {
    const { newspaperNames } = require('./src/Backend/helper/Functions.js');
    win.webContents.send('papers:got', await newspaperNames(grpCode));
});

ipcMain.on('edition:get', async (event) => {
    const { editionList } = require('./src/Backend/helper/Functions.js');
    win.webContents.send('edition:got', await editionList());
});

ipcMain.on('roData:get', async (event, arg, btn) => {
    const { roData } = require('./src/Backend/helper/Input/RoFunc.js');
    const RoSame = require('./src/Backend/models/Input/RoSame.js');
    var data = null;
    if (btn == 'f') data = await RoSame.findOne({ attributes: ['RoNo'], order: ['RoNo'] });
    else if(btn == 'l') data = await RoSame.findOne({attributes: ['RoNo'], order: [['RoNo', 'DESC']]});
    if(data != null) arg = data.dataValues.RoNo;
    var arr = await roData(arg);
    win.webContents.send('roData:got', arr[0], arr[1]);
});

ipcMain.on('addEditRO', async (event, same, diff) => {
    const { addEditRO } = require('./src/Backend/helper/Input/RoFunc.js');
    try {
        win.webContents.send('roData:saved', await addEditRO(same, diff));
    }
    catch (err) {
        showError(err.stack)
        win.webContents.send('roData:saved', null);
    }
});

ipcMain.on('ro:prt', async (event, sameD, diffD) => {
    const Comp = require('./src/Backend/models/Master/Comp.js');
    const PaperGroups = require('./src/Backend/models/Master/PaperGroups.js');
    const Newspaper = require('./src/Backend/models/Master/Newspaper.js');
    const Edition = require('./src/Backend/models/Master/Edition.js');
    const { createRo } = require('./src/Backend/helper/Input/createRo.js');
    const { createRoExcel } = require('./src/Backend/helper/Input/createRoExcel.js');

    try {
        var cData = await Comp.findOne();
        var gData = await PaperGroups.findOne({ where: {Code: sameD.GroupCode} });
        sameD['HoLoc'] = gData.dataValues.HoLoc;
    
        var papers = await Newspaper.findAll({ attributes: ['ShortName', 'PaperName'], where: {GroupCode: sameD.GroupCode} });
        var cities = await Edition.findAll();
        let paperMap = {}, cityMap = {};
        for (let ele of papers) paperMap[ele.dataValues['ShortName']] = ele.dataValues['PaperName'];
        for(let ele of cities) cityMap[ele.dataValues['Code']] = ele.dataValues['CityName'];

        let signStamp = path.join(__dirname, 'assets/images/signStamp.png');
        let Logo = path.join(__dirname, 'assets/images/Logo.png');
        createRo(Logo, sameD, diffD, cData.dataValues, paperMap, cityMap, signStamp);
        let pt = `${cData.dataValues.File_path}RO-${sameD.RoNo}.xlsx`;
        createRoExcel(sameD, diffD, cData.dataValues, paperMap, cityMap, Logo, signStamp, pt);

        win.webContents.send('ro:prted', pt);
    }
    catch (err) {
        showError(err.stack)
        win.webContents.send('ro:prted', null);
    }
});

// NEW BILL ////////////////////////////////////////

ipcMain.on('roCust:get', async (event) => {
    const RoSame = require('./src/Backend/models/Input/RoSame.js');
    const Vend = require('./src/Backend/models/Master/Vendor.js');
    try {
        var vObj = {};
        var data = await RoSame.findAll({ attributes: ['RoNo', 'RoDate', 'VendCode'], where: {BillNo: {[Op.is]: null}} });
        for(let i in data) {
            if (data[i]['VendCode'] in vObj) data[i].dataValues['VendName'] = vObj[data[i]['VendCode']];
            else {
                data[i].dataValues['VendName'] = ( await Vend.findOne({ attributes: ['Name'], where: {id: data[i].dataValues.VendCode} }) ).dataValues.Name;
                vObj[data[i]['VendCode']] = data[i].dataValues['VendName'];
            }
        }
        win.webContents.send('roCust:got', data);
    } catch (err) {
        showError(err.stack);
        win.webContents.send('roCust:got', null);
    }
});

ipcMain.on('bill:make', async (event, roNo, obj, btype) => {
    try {
        const RoSame = require('./src/Backend/models/Input/RoSame.js');
        const { createBill } = require('./src/Backend/helper/Input/createBill.js');
        const { billAdd, billPrtData } = require('./src/Backend/helper/Input/BillFunc.js');
        let rupee = path.join(__dirname, 'assets/images/Rupee.png');

        var billNo = ( await RoSame.findOne({ attributes: ['BillNo'], order: [['BillNo', 'DESC']] }) ).dataValues.BillNo;
        billNo = billNo == null ? 1 : billNo+1;
        await billAdd(obj, roNo, billNo);

        let arr = await billPrtData(billNo, billNo);
        createBill(arr[0], rupee, btype, arr[1]);
        win.webContents.send('bill:made');
    }
    catch (err) {
        showError(err.stack);
        win.webContents.send('bill:made');
    }
});

// EDIT BILL ///////////////////////////////////////////////

ipcMain.on('billData:get', async (event, bNo) => {
    try {
        const RoSame = require('./src/Backend/models/Input/RoSame.js');
        const Bill = require('./src/Backend/models/Input/Bill.js');
        let rData = await RoSame.findOne({ attributes: ['Advance'], where: { BillNo: bNo } });
        if(rData != null) {
            let bData = await Bill.findOne({ where: {BillNo: bNo} });
            win.webContents.send('billData:got', rData.dataValues.Advance, bData.dataValues);
        }
        else win.webContents.send('billData:got', null, {});
    } catch (err) {
        showError(err.stack);
        win.webContents.send('billData:got', null, null);
    }
});

ipcMain.on('billData:add', async (event, adv, arg) => {
    try {
        const RoSame = require('./src/Backend/models/Input/RoSame.js');
        const Bill = require('./src/Backend/models/Input/Bill.js');

        let c = await RoSame.count({ where: { BillNo: arg['BillNo'] } });
        if (c) {
            await RoSame.update({ Advance: adv }, { where: { BillNo: arg['BillNo'] } });
            await Bill.update(arg, { where: { BillNo: arg['BillNo'] } });
            win.webContents.send('billData:added', 'Bill updated!');
        }
        else win.webContents.send('billData:added', 'Bill not found!');
    } catch (err) {
        showError(err.stack);
        win.webContents.send('billData:added', null);
    }
});

// REPORTS ////////////////////////////////////////////////////////

// PRINT BILL ///////////////////////////////////////////

ipcMain.on('bill:prt', async (event, start, end, btype) => {
    try {
        const { createBill } = require('./src/Backend/helper/Input/createBill.js');
        const { billPrtData } = require('./src/Backend/helper/Input/BillFunc.js');
        let rupee = path.join(__dirname, 'assets/images/Rupee.png');

        let arr = await billPrtData(start, end);
        createBill(arr[0], rupee, btype, arr[1]);
        win.webContents.send('bill:prted');
    } catch (err) {
        showError(err.stack);
        win.webContents.send('bill:prted');
    }
});

// BILL REPORT //////////////////////////////////

ipcMain.on('billReport:prt', async (event, from, to, bType, bStatus) => {
    const Vend = require('./src/Backend/models/Master/Vendor.js');
    const Edition = require('./src/Backend/models/Master/Edition.js');
    const Newspaper = require('./src/Backend/models/Master/Newspaper.js');
    const PaperGroups = require('./src/Backend/models/Master/PaperGroups.js');
    const Comp = require('./src/Backend/models/Master/Comp.js');
    const RoSame = require('./src/Backend/models/Input/RoSame.js');
    const RoPaper = require('./src/Backend/models/Input/RoPaper.js');
    const { createBillReport } = require('./src/Backend/helper/Report/BillReport.js');
    try {
        let sameD = null, arr = [], gObj = {}, vObj = {}, eObj = {}, nObj = {};
        if (bStatus == "I") {
            sameD = await RoSame.findAll({ attributes: ['RoNo', 'GroupCode', 'VendCode', 'RoDate', 'CGst', 'SGst', 'IGst', 'TradeDis', 'SplDis', 'BillNo', 'BillDate']
                , where: { BillDate: { [Op.between]: [from, to] }, BillNo: { [Op.ne]: null } }, order: ['BillDate', 'BillNo', 'RoNo']
            });
        }
        else if (bStatus == "N") {
            sameD = await RoSame.findAll({ attributes: ['RoNo', 'GroupCode', 'VendCode', 'RoDate', 'CGst', 'SGst', 'IGst', 'TradeDis', 'SplDis', 'BillNo', 'BillDate']
                , where: { BillDate: { [Op.between]: [from, to] }, BillNo: { [Op.is]: null } }, order: ['BillDate', 'BillNo', 'RoNo']
            });
        }
        else {
            sameD = await RoSame.findAll({ attributes: ['RoNo', 'GroupCode', 'VendCode', 'RoDate', 'CGst', 'SGst', 'IGst', 'TradeDis', 'SplDis', 'BillNo', 'BillDate']
            , where: { BillDate: { [Op.between]: [from, to] }}, order: ['BillDate', 'BillNo', 'RoNo'] });
        }

        for (let i of sameD) {
            let diffD = null, vCode = i.dataValues.VendCode, gCode = i.dataValues.GroupCode, vData = null;

            if (!(vCode in vObj)) {
                vData = await Vend.findOne({ attributes: ['Name', 'Gstin', 'Status'], where: {id: vCode} });
                if(vData == null) showError(`Data issue with vendor code ${vCode}`);
                vObj[vCode] = [vData.dataValues.Name, vData.dataValues.Gstin, vData.dataValues.Status];
            }

            if (!(gCode in gObj)) {
                gObj[gCode] = (await PaperGroups.findOne({ attributes: ['GroupName'], where: { Code: gCode } })).dataValues.GroupName;
            }

            if(bType == 'R') {
                diffD = await RoPaper.findAll({ attributes: ['ShortName', 'EditionCode', 'RatePR', 'RateCR', 'Width', 'Height', 'PBillNo']
                , where: { RoNo: i.dataValues.RoNo, PBillNo: {[Op.ne]: null} } });
            }
            else if (bType == 'N') {
                diffD = await RoPaper.findAll({
                    attributes: ['ShortName', 'EditionCode', 'RatePR', 'RateCR', 'Width', 'Height', 'PBillNo']
                    , where: { RoNo: i.dataValues.RoNo, PBillNo: { [Op.is]: null } }
                });
            }
            else {
                diffD = await RoPaper.findAll({
                    attributes: ['ShortName', 'EditionCode', 'RatePR', 'RateCR', 'Width', 'Height', 'PBillNo']
                    , where: { RoNo: i.dataValues.RoNo }
                });
            }

            for(let j of diffD) {
                let eCode = j.dataValues.EditionCode, sName = j.dataValues.ShortName;

                if (!(eCode in eObj)) {
                    eObj[eCode] = ( await Edition.findOne({ where: {Code: eCode} }) ).dataValues.CityName;
                }
                if (!(sName in nObj)) {
                    nObj[sName] = (await Newspaper.findOne({ attributes: ['PaperName'],  where: { ShortName: sName } })).dataValues.PaperName;
                }

                let tmp = [i.dataValues.RoNo, vObj[vCode][0], nObj[sName], eObj[eCode], gObj[gCode], j.dataValues.Width, j.dataValues.Height, i.dataValues.RoDate
                    , j.dataValues.RateCR, j.dataValues.RatePR, i.dataValues.BillNo, i.dataValues.BillDate, vObj[vCode][1]
                    , i.dataValues.CGst, i.dataValues.SGst, i.dataValues.IGst, i.dataValues.SplDis, i.dataValues.TradeDis, j.dataValues.PBillNo, vObj[vCode][2]];

                arr.push(tmp);
            }
        }

        let pt = (await Comp.findOne({ attributes: ['File_path'] })).dataValues.File_path + 'Print.xlsx';
        await createBillReport(arr, pt);
        win.webContents.send('billReport:prted', pt);
    } catch (err) {
        showError(err.stack);
        win.webContents.send('billReport:prted', null);
    }
});

// UTILITIES ///////////////////////////////////////////////
// Back&Res //////////////////////////////////////////////////////////////////
ipcMain.on('db:backup', async () => {
    var Comp = require('./src/Backend/models/Master/Comp');
    var exec = require('child_process').exec;
    var data = (await Comp.findOne({ attributes: ['Code', 'File_path'] }));
    var today = new Date();
    var date = today.getDate() + '' + (today.getMonth() + 1) + '' + today.getFullYear();
    if (data.dataValues.File_path == null) win.webContents.send('Db:backed', 'First set storage path in settings!')
    else {
        var path = data.dataValues.File_path;
        var db = await sequelize.query('Select database() as db_name');
        var cmd = 'mysqldump -uroot -h192.168.1.9 -pCALCULATION1164 ' + db[0][0].db_name + ' > ' + path + db[0][0].db_name + '-' + date + '.sql';
        await exec(cmd);
        win.webContents.send('db:backed', 'Database backup created!');
    }
});

ipcMain.on('db:restore', async (event) => {
    var Restore_info = require('./src/Backend/models/Restore_info.js');
    var c = await dialog.showOpenDialog({ filters: [{ name: '', extensions: ['sql'], properties: ['openFile'] }] });
    if (c.canceled == false) {
        let ans = await dialog.showMessageBox({ type: "warning", buttons: ["Yes", "No"], message: "Do you really want to restore all data?" });
        if (ans.response) win.webContents.send('db:restored', 'Restoration cancelled!');
        else {
            var pt = (c.filePaths + '').split('\\');
            var file = pt[pt.length - 1].split('-');
            var db = await sequelize.query('Select database() as db_name');
            if (file[0] != db[0][0].db_name) win.webContents.send('db:restored', 'Incorrect file selected!');
            else {
                var exec = require('child_process').exec;
                var cmd = 'mysql -uroot -h192.168.1.9 -pCALCULATION1164 ' + db[0][0].db_name + ' < ' + c.filePaths;
                await exec(cmd, async (error) => {
                    if (error) win.webContents.send('db:restored', 'Error occured while restoration!');
                    else {
                        var today = new Date() + '';
                        await Restore_info.create({ Path: c.filePaths + '', DateTime: today });
                        win.webContents.send('db:restored', 'Database restored!');
                    }
                });
            }
        }
    }
    else win.webContents.send('db:restored', 'Restoration cancelled!');
});