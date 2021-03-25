var Excel = require('exceljs');
var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function createRoExcel(sameD, diffD, paperMap, cityMap, pt) {
    // A new Excel Work Book
    var workbook = new Excel.Workbook();

    // Create a sheet
    var sheet1 = workbook.addWorksheet('Summary', { pageSetup: { paperSize: 5, orientation: 'landscape', fitToPage: true } });
    summSheet(sheet1, sameD, diffD, paperMap, cityMap);

    var sheet2 = workbook.addWorksheet('Mail', { pageSetup: { paperSize: 5, orientation: 'landscape', fitToPage: true } });
    mailSheet(sheet2, sameD, diffD, paperMap, cityMap);

    // Save Excel on Hard Disk
    workbook.xlsx.writeFile(pt);
}

function summSheet(sheet, sameD, diffD, paperMap, cityMap) {
    // A table header
    sheet.columns = [
        { header: '', key: 'caption', width: 35 },
        { header: '', key: 'paper', width: 22 },
        { header: '', key: 'edition', width: 18 },
        { header: '', key: 'rate', width: 10 },
        { header: `${sameD.VendName}`, key: 'width', width: 5 },
        { header: '', key: 'x', width: 5 },
        { header: '', key: 'height', width: 5 },
        { header: '', key: 'date', width: 11 },
        { header: '', key: 'day', width: 11 }
    ]

    sheet.getRow(3).getCell(1).value = `RO - ${sameD.RoNo}`;
    sheet.getRow(5).getCell(1).value = sameD.VendName;
    sheet.getRow(6).getCell(1).value = sameD.SubjectDetail;
    sheet.getRow(7).getCell(1).value = sameD.Position;

    let head = ['CAPTION', 'NEWSPAPER', 'EDITIONS', 'RATES', 'SIZE', '', '', 'DATE', 'DAY'];
    for (let i = 0; i < head.length; i++) sheet.getRow(8).getCell(i + 1).value = head[i];

    let idx = 9;
    for (let obj of diffD) {
        sheet.getRow(idx).getCell(1).value = obj.Caption;
        sheet.getRow(idx).getCell(2).value = paperMap[obj.ShortName];
        sheet.getRow(idx).getCell(3).value = cityMap[obj.EditionCode];
        sheet.getRow(idx).getCell(4).value = (parseFloat(obj.RatePR)).toFixed(2);
        sheet.getRow(idx).getCell(5).value = parseInt(obj.Width);
        sheet.getRow(idx).getCell(6).value = 'x';
        sheet.getRow(idx).getCell(7).value = parseInt(obj.Height);
        sheet.getRow(idx).getCell(8).value = formatDate(obj.DateP);
        let day = days[new Date(obj.DateP).getDay()];
        sheet.getRow(idx).getCell(9).value = day;
        idx += 1;
    }

    styling1(sheet, head.length, idx);
}

function styling1(sheet, hLen, tLen) {
    sheet.mergeCells(1, 5, 2, 9);
    sheet.mergeCells(3, 5, 4, 9);
    sheet.mergeCells(8, 5, 8, 7);

    sheet.getRow(1).font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(3).font = { name: 'Arial Black', size: 18, bold: true };
    for (let i = 4; i <= 7; i++) sheet.getRow(i).font = { bold: true, underline: true };
    sheet.getRow(8).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    sheet.getRow(1).getCell(5).alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getRow(8).getCell(5).alignment = { horizontal: 'center' };
    for (let i = 9; i < tLen; i++) {
        for (let j = 4; j <= 8; j++) sheet.getRow(i).getCell(j).alignment = { horizontal: 'center' };
    }

    sheet.getCell('E1').fill = {
        type: 'pattern',
        pattern: 'solid',
        bgColor: { argb: '255000000' }
    };
    for (let i = 0; i < hLen; i++) {
        sheet.getRow(8).getCell(i + 1).fill = {
            type: 'pattern',
            pattern: 'solid',
            bgColor: { argb: '255000000' }
        };
    }
}

function mailSheet(sheet, sameD, diffD, paperMap, cityMap) {
    // A table header
    sheet.columns = [
        { header: 'Dear Sir / Madam,', key: 'paper', width: 22 },
        { header: '', key: 'edition', width: 18 },
        { header: '', key: 'rate', width: 10 },
        { header: '', key: 'width', width: 5 },
        { header: '', key: 'x', width: 5 },
        { header: '', key: 'height', width: 5 },
        { header: '', key: 'date', width: 11 },
        { header: '', key: 'day', width: 11 },
        { header: '', key: 'position', width: 35 }
    ]

    sheet.getRow(2).getCell(1).value = 'Kindly reserve space for publication of advertisement as per RO (attached) and instructions given below:';
    sheet.getRow(4).getCell(1).value = 'RO No.';
    sheet.getRow(4).getCell(2).value = sameD.RoNo;
    sheet.getRow(4).getCell(3).value = 'for booking of advertisement';
    sheet.getRow(5).getCell(1).value = "Client's Name";
    sheet.getRow(5).getCell(2).value = sameD.VendName;
    sheet.getRow(6).getCell(1).value = 'Subject ';
    sheet.getRow(6).getCell(2).value = sameD.SubjectDetail;

    let head = ['NEWSPAPER', 'EDITIONS', 'RATES', 'SIZE', '', '', 'DATE', 'DAY', 'POSITION'];
    for (let i = 0; i < head.length; i++) sheet.getRow(8).getCell(i + 1).value = head[i];

    let idx = 9;
    for (let obj of diffD) {
        sheet.getRow(idx).getCell(1).value = paperMap[obj.ShortName];
        sheet.getRow(idx).getCell(2).value = cityMap[obj.EditionCode];
        sheet.getRow(idx).getCell(3).value = (parseFloat(obj.RatePR)).toFixed(2);
        sheet.getRow(idx).getCell(4).value = parseInt(obj.Width);
        sheet.getRow(idx).getCell(5).value = 'x';
        sheet.getRow(idx).getCell(6).value = parseInt(obj.Height);
        sheet.getRow(idx).getCell(7).value = formatDate(obj.DateP);
        let day = days[new Date(obj.DateP).getDay()];
        sheet.getRow(idx).getCell(8).value = day;
        sheet.getRow(idx).getCell(9).value = obj.Position;
        idx += 1;
    }

    sheet.getRow(idx).getCell(1).value = 'Special Instructions :   1.';
    sheet.getRow(idx).getCell(2).value = sameD.Spl1;
    sheet.getRow(idx+1).getCell(1).value = 'Special Instructions :   2.';
    sheet.getRow(idx+1).getCell(2).value = sameD.Spl2;
    sheet.getRow(idx + 2).getCell(1).value = 'In case of any urgency contact :  Ms. Pooja Aggarwal - 9818715400          or           Mr. Lovlesh Sharma - 9810029747';

    styling2(sheet, head.length, idx);
}

function styling2(sheet, hLen, tLen) {
    sheet.mergeCells(8, 4, 8, 6);
    for(let i of [0, 1, 2]) sheet.mergeCells(tLen+i, 1, tLen+i, 9);

    for(let i of [4, 5, 6]) {
        sheet.getRow(i).getCell(1).font = { bold: true };
        sheet.getRow(i).getCell(2).font = { bold: true };
    }
    sheet.getRow(4).getCell(2).font = { name: 'Arial Black', size: 14 };
    sheet.getRow(8).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(tLen+2).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    sheet.getRow(8).getCell(4).alignment = { horizontal: 'center' };
    for (let i = 9; i < tLen; i++) {
        for (let j = 4; j <= 8; j++) sheet.getRow(i).getCell(j).alignment = { horizontal: 'center' };
    }
    sheet.getRow(tLen+2).getCell(1).alignment = { horizontal: 'center' };

    for (let i = 0; i < hLen; i++) {
        sheet.getRow(8).getCell(i + 1).fill = {
            type: 'pattern',
            pattern: 'solid',
            bgColor: { argb: '255000000' }
        };
    }
    for (let i=9; i<tLen; i++) {
        for (let j=1; j<=9; j++) {
            sheet.getRow(i).getCell(j).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFDBF3FA' }
            };
        }
    }
    for(let i of [0, 1]) {
        for(let j of [1, 2]) {
            sheet.getRow(tLen+i).getCell(j).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFB6C1' }
            };
        }
    }
    sheet.getRow(tLen+2).getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        bgColor: { argb: '255000000' }
    };
}

function formatDate(date) {
    var arr = date.split('-')
    return arr[2] + "-" + arr[1] + "-" + arr[0];
}

module.exports = { createRoExcel };