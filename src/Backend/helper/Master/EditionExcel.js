var Excel = require('exceljs');

function createExcelEdition(arr, path) {
    // A new Excel Work Book
    var workbook = new Excel.Workbook();

    // Create a sheet
    var sheet = workbook.addWorksheet('Sheet1');
    // A table header
    sheet.columns = [
        { header: 'CODE', key: 'code', width: 12 },
        { header: 'CITY NAME', key: 'name', width: 35 }
    ]

    // Add rows in the above header
    for (let i in arr) sheet.addRow({ code: arr[i].Code, name: arr[i].CityName });

    // Save Excel on Hard Disk
    workbook.xlsx.writeFile(path)
}

module.exports = { createExcelEdition };
