var Excel = require('exceljs');

function createSchedule(arr, pt) {
    // A new Excel Work Book
    var workbook = new Excel.Workbook();

    var sheet = workbook.addWorksheet('Sheet1', { pageSetup: { paperSize: 9, fitToPage: true } });

    // A table header
    sheet.columns = [
        { header: 'PUB DATE', key: 'pDate', width: 11 },
        { header: 'RO NO.', key: 'roNo', width: 8 },
        { header: 'CLIENT', key: 'client', width: 28 },
        { header: 'NEWSPAPER', key: 'paper', width: 24 },
        { header: 'EDITIONS', key: 'edition', width: 12 },
        { header: 'GROUP', key: 'group', width: 20 },
        { header: 'W', key: 'width', width: 5 },
        { header: 'H', key: 'height', width: 5 },
        { header: 'CR', key: 'cr', width: 8 },
        { header: 'PR', key: 'pr', width: 8 },
    ]

    for (let ele of arr) {
        sheet.addRow({
            pDate: formatDate(ele[0]), roNo: ele[1], client: ele[2], paper: ele[3], edition: ele[4], group: ele[5]
            , width: ele[6], height: ele[7], cr: commaSeparated(ele[8]), pr: commaSeparated(ele[9])
        });
    }

    styling(sheet);

    // Save Excel on Hard Disk
    workbook.xlsx.writeFile(pt);
}

function styling(sheet) {
    for (let i of [1, 2, 7, 8]) sheet.getRow(1).getCell(i).alignment = { horizontal: 'center' };

    for (let i = 1; i <= 10; i++) {
        sheet.getRow(1).getCell(i).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF00008B' }
        };
    }

    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    let rows = sheet.rowCount;

    for (let i = 2; i <= rows; i++) {
        for (let j of [1, 2, 7, 8]) sheet.getRow(i).getCell(j).alignment = { horizontal: 'center' };
    }
}

function commaSeparated(num) {
    return num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function formatDate(date) {
    var arr = date.split('-')
    return arr[2] + "-" + arr[1] + "-" + arr[0];
}

module.exports = { createSchedule };