var Excel = require('exceljs');

function createExcelVend(arr, path) {
    // A new Excel Work Book
    var workbook = new Excel.Workbook();

    // Create a sheet
    var sheet = workbook.addWorksheet('Sheet1');
    // A table header
    sheet.columns = [
        {header: 'ID', key: 'id', width: 5},
        { header: 'VEND NAME', key: 'vname', width: 30 },
        {header: 'IDENTIFIER', key: 'identify', width: 15},
        { header: 'STREET1', key: 'street1', width: 40 },
        { header: 'STREET2', key: 'street2', width: 40 },
        { header: 'CITY', key: 'city', width: 40 },
        { header: 'PINCODE', key: 'pincode', width: 12 },
        { header: 'STATE', key: 'state', width: 40 },
        { header: 'CONTACT PERSON', key: 'person', width: 18 },
        { header: 'CONTACT NO', key: 'contact', width: 14 },
        { header: 'GSTIN', key: 'gstin', width: 18 },
        { header: 'PAN', key: 'pan', width: 14 },
        { header: 'STATUS', key: 'status', width: 7 }
    ]

    // Add rows in the above header
    for (let i in arr) sheet.addRow({ id: arr[i].id, vname: arr[i].Name, identify: arr[i].Identify, street1: arr[i].Street1, street2: arr[i].Street2, city: arr[i].City, pincode: arr[i].Pincode, state: arr[i].State, person: arr[i].ContactPerson, contact: arr[i].ContactNo, gstin: arr[i].Gstin, pan: arr[i].Pan, status: arr[i].Status });

    // Save Excel on Hard Disk
    workbook.xlsx.writeFile(path)
}

module.exports = { createExcelVend };
