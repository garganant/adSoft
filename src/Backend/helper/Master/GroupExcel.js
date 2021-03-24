var Excel = require('exceljs');

function createExcelGroup(arr, path) {
    // A new Excel Work Book
    var workbook = new Excel.Workbook();

    // Create a sheet
    var sheet = workbook.addWorksheet('Sheet1');
    // A table header
    sheet.columns = [
        { header: 'GROUP CODE', key: 'code', width: 12 },
        { header: 'GROUP NAME', key: 'name', width: 35 },
        { header: 'HO LOCATION', key: 'loc', width: 35 }
    ]

    // Add rows in the above header
    for (let i in arr) sheet.addRow({ code: arr[i].Code, name: arr[i].GroupName, loc: arr[i].HoLoc });

    // Save Excel on Hard Disk
    workbook.xlsx.writeFile(path)
}

module.exports = { createExcelGroup };
