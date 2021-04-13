var Excel = require('exceljs');

function createBillReport(arr, pt) {
    // A new Excel Work Book
    var workbook = new Excel.Workbook();

    var sheet = workbook.addWorksheet('Sheet1', { pageSetup: { paperSize: 9, fitToPage: true } });

    // A table header
    sheet.columns = [
        { header: 'RELEASE ORDER', key: 'roNo', width: 8 },
        { header: '', key: 'client', width: 20 },
        { header: '', key: 'paper', width: 24 },
        { header: '', key: 'edition', width: 12 },
        { header: '', key: 'group', width: 14 },
        { header: '', key: 'width', width: 5 },
        { header: '', key: 'height', width: 5 },
        { header: '', key: 'pDate', width: 11 },
        { header: '', key: 'cr', width: 7 },
        { header: '', key: 'pr', width: 7 },
        { header: 'BILLING TO CLIENT', key: 'billNo', width: 8 },
        { header: '', key: 'bDate', width: 11 },
        { header: '', key: 'gstNo', width: 18 },
        { header: '', key: 'cGross', width: 12 },
        { header: '', key: 'cCgst', width: 8 },
        { header: '', key: 'cSgst', width: 8 },
        { header: '', key: 'cIgst', width: 8 },
        { header: '', key: 'cTotal', width: 11 },
        { header: '', key: 'cDis', width: 12 },
        { header: '', key: 'cPay', width: 11 },
        { header: 'BILLING FROM PUBLICATION', key: 'pGross', width: 10 },
        { header: '', key: 'comm', width: 9 },
        { header: '', key: 'net', width: 10 },
        { header: '', key: 'pCgst', width: 5 },
        { header: '', key: 'pSgst', width: 5 },
        { header: '', key: 'pGst', width: 8 },
        { header: '', key: 'pPay', width: 11 },
        { header: '', key: 'pBillNo', width: 18 },
        { header: 'GA-GA', key: 'diff', width: 12 },
        { header: 'GA-NP', key: 'profit', width: 12 }
    ]

    let head = ['RO NO.', 'CLIENT', 'NEWSPAPER', 'EDITIONS', 'GROUP', 'W', 'H', 'PUB DATE', 'CR', 'PR', 'BILL NO'
        , 'BILL DATE', 'GST NUMBER', 'Gross Amt', 'CGST', 'SGST', 'IGST', 'TOTAL', 'DISCOUNT', 'PAYABLE', 'GROSS', 'COMM'
        , 'NET', 'CGST', 'SGST', 'GST', 'NP', 'PUB BILLS', 'DIFFERENCE', 'NET PROFIT'];

    for(let i=1; i <= head.length; i++) sheet.getRow(2).getCell(i).value = head[i-1];

    for(let ele of arr) {
        let gross = ele[6] ? Math.round(ele[5] * ele[6] * ele[8]) : Math.round(ele[8]);
        let cgst = +(ele[19] == 'L' ? (gross * ele[13] * 0.01).toFixed(2) : 0);
        let sgst = +(ele[19] == 'L' ? (gross * ele[14] * 0.01).toFixed(2) : 0);
        let igst = +(ele[19] == 'C' ? (gross * ele[15] * 0.01).toFixed(2) : 0);
        let total = +((gross + cgst + sgst + igst).toFixed(2));
        let dis = +((total * ele[16] * 0.01).toFixed(2));
        let pay = +((total - dis).toFixed(2));

        let pgross = ele[6] ?  Math.round(ele[5] * ele[6] * ele[9]) : Math.round(ele[9]);
        let pDis = +((pgross * ele[17] * 0.01).toFixed(2));
        let netP = +((pgross - pDis).toFixed(2));
        let gst = +((netP * 0.05).toFixed(2));
        let np = +((netP + gst).toFixed(2));

        sheet.addRow({ roNo: ele[0], client: ele[1], paper: ele[2], edition: ele[3], group: ele[4], width: ele[5]
            , height: ele[6], pDate: formatDate(ele[7]), cr: parseFloat(ele[8]), pr: parseFloat(ele[9]), billNo: ele[10], bDate: formatDate(ele[11]), gstNo: ele[12]
            , cGross: gross, cCgst: cgst, cSgst: sgst, cIgst: igst, cTotal: total, cDis: dis, cPay: pay
            , pGross: pgross, comm: pDis, net: netP, pCgst: 0, pSgst: 0, pGst: gst, pPay: np, pBillNo: ele[18], diff: gross - pgross, profit: gross - netP });
    }

    styling(sheet);

    // Save Excel on Hard Disk
    workbook.xlsx.writeFile(pt);
}

function styling(sheet) {
    sheet.mergeCells(1, 1, 1, 10);
    sheet.mergeCells(1, 11, 1, 20);
    sheet.mergeCells(1, 21, 1, 28);

    for (let i = 1; i <= 30; i++) sheet.getRow(1).getCell(i).alignment = { horizontal: 'center' };
    for (let i of [1, 6, 7, 8, 15, 16, 17, 24, 25]) sheet.getRow(2).getCell(i).alignment = { horizontal: 'center' };

    sheet.getRow(1).getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF6B8E23' }
    };

    for (let i of [11, 29, 30]) {
        sheet.getRow(1).getCell(i).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF0000FF' }
        };
    }

    sheet.getRow(1).getCell(21).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFA500' }
    };

    for(let i = 1; i <= 30; i++) {
        sheet.getRow(2).getCell(i).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF00008B' }
        };
    }

    for(let i of [1, 2]) sheet.getRow(i).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    let rows = sheet.rowCount;

    for(let i = 3; i <= rows; i++) {
        for(let j of [1, 6, 7, 8, 15, 16, 17, 24, 25]) sheet.getRow(i).getCell(j).alignment = { horizontal: 'center' };
        for (let j of [9, 10]) sheet.getRow(i).getCell(j).alignment = { horizontal: 'right' };
        sheet.getRow(i).getCell(11).alignment = { horizontal: 'left' };
        for (let j of [11, 13]) sheet.getRow(i).getCell(j).font = { bold: true, color: { argb: 'FFFF0000' } };
        for (let j of [12, 13, 15, 16, 17, 18, 19, 20]) sheet.getRow(i).getCell(j).font = { bold: true };

    }
}

function formatDate(date) {
    if(date == null) return '';
    var arr = date.split('-')
    return arr[2] + "-" + arr[1] + "-" + arr[0];
}

module.exports = { createBillReport };