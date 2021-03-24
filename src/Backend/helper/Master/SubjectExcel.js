var Excel = require('exceljs');

function createExcelSubject(arr, path) {
    // A new Excel Work Book
    var workbook = new Excel.Workbook();

    // Create a sheet
    var sheet = workbook.addWorksheet('Sheet1');
    // A table header
    sheet.columns = [
        { header: 'Sno', key: 'code', width: 6 },
        { header: 'SUBJECT DETAIL', key: 'sub', width: 50 }
    ]

    // Add rows in the above header
    for (let i in arr) sheet.addRow({ code: arr[i].Code, sub: arr[i].SubjectDetail });

    // Save Excel on Hard Disk
    workbook.xlsx.writeFile(path)
}

module.exports = { createExcelSubject };
