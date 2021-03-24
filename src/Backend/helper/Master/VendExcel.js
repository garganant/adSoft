var Excel = require('exceljs');

function createExcelVend(arr, path) {
    // A new Excel Work Book
    var workbook = new Excel.Workbook();

    // Create a sheet
    var sheet = workbook.addWorksheet('Sheet1');
    // A table header
    sheet.columns = [
        { header: 'VEND NAME', key: 'vname', width: 30 },
        { header: 'ADDRESS', key: 'address', width: 40 },
        { header: 'CONTACT PERSON', key: 'person', width: 18 },
        { header: 'CONTACT NO', key: 'contact', width: 14 },
        { header: 'GSTIN', key: 'gstin', width: 18 },
        { header: 'PAN', key: 'pan', width: 14 },
        { header: 'STATUS', key: 'status', width: 7 }
    ]

    // Add rows in the above header
    for (let i in arr) sheet.addRow({ vname: arr[i].Name, address: arr[i].Address, person: arr[i].ContactPerson, contact: arr[i].ContactNo, gstin: arr[i].Gstin, pan: arr[i].Pan, status: arr[i].Status });

    // Save Excel on Hard Disk
    workbook.xlsx.writeFile(path)
}

module.exports = { createExcelVend };
