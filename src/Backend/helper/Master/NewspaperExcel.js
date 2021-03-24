var Excel = require('exceljs');

function createExcelNewspaper(arr, path) {
    // A new Excel Work Book
    var workbook = new Excel.Workbook();

    // Create a sheet
    var sheet = workbook.addWorksheet('Sheet1');
    // A table header
    sheet.columns = [
        { header: 'SHORT NAME', key: 'short', width: 12 },
        { header: 'NEWSPAPER NAME', key: 'name', width: 35 },
        { header: 'GROUP CODE', key: 'code', width: 12 }
    ]

    // Add rows in the above header
    for (let i in arr) sheet.addRow({ short: arr[i].ShortName, name: arr[i].PaperName, code: arr[i].GroupCode });

    // Save Excel on Hard Disk
    workbook.xlsx.writeFile(path)
}

module.exports = { createExcelNewspaper };
