var Excel = require('exceljs');
var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function createRoExcel(sameD, diffD, compD, paperMap, cityMap, signStamp, pt) {
    // A new Excel Work Book
    var workbook = new Excel.Workbook();

    //Add image to workbook
    const imageId1 = workbook.addImage({
        filename: signStamp,
        extension: 'png',
    });

    // Create a sheet
    var sheet1 = workbook.addWorksheet('Summary', { pageSetup: { paperSize: 9, fitToPage: true } });
    summSheet(sheet1, sameD, diffD, compD, paperMap, cityMap, imageId1);

    var sheet2 = workbook.addWorksheet('Mail', { pageSetup: { paperSize: 9, fitToPage: true } });
    mailSheet(sheet2, sameD, diffD, paperMap, cityMap);

    // Save Excel on Hard Disk
    workbook.xlsx.writeFile(pt);
}

function summSheet(sheet, sameD, diffD, compD, paperMap, cityMap, imageId1) {
    // A table header
    sheet.columns = [
        { header: '', key: 'caption', width: 27 },
        { header: '', key: 'paper', width: 20 },
        { header: '', key: 'edition', width: 28 },
        { header: '', key: 'rate', width: 10 },
        { header: '', key: 'width', width: 5 },
        { header: '', key: 'x', width: 5 },
        { header: '', key: 'height', width: 5 },
        { header: '', key: 'date', width: 11 },
        { header: '', key: 'day', width: 11 }
    ]
    roPart(sheet, sameD, diffD, compD, paperMap, cityMap, imageId1);
    summPart(sheet, sameD, diffD, paperMap, cityMap);
}

function roPart(sheet, sameD, diffD, compD, paperMap, cityMap, imageId1) {

    sheet.getRow(1).getCell(4).value = compD.Name;
    sheet.getRow(2).getCell(9).value = compD.Address;
    sheet.getRow(3).getCell(1).value = 'Kind Attention :';
    sheet.getRow(3).getCell(3).value = `Tel. ${compD.Phone} Fax: ${compD.Fax} Cell: ${compD.Mobile}`;
    sheet.getRow(4).getCell(9).value = `Email: ${compD.Email} Website: ${compD.Website}`;
    sheet.getRow(5).getCell(1).value = 'The Advertisement Manager';
    sheet.getRow(5).getCell(2).value = `INS / AGENCY CODE: ${compD.Code} | GST: ${compD.Gstin} | PAN: ${compD.Pan} | CIN: ${compD.Cin}`;
    sheet.getRow(6).getCell(1).value = sameD.GroupName;
    sheet.getRow(7).getCell(1).value = sameD.HoLoc;
    sheet.getRow(10).getCell(1).value = 'Dear Sir,';
    sheet.getRow(11).getCell(1).value = 'Kindly arrange to publish the advertisement(s) as per terms and conditions and instructions below:';
    sheet.getRow(11).getCell(7).value = 'RELEASE ORDER';
    sheet.getRow(12).getCell(7).value = 'RO No.';
    sheet.getRow(12).getCell(8).value = sameD.RoNo;
    sheet.getRow(12).getCell(1).value = 'Client :';
    sheet.getRow(12).getCell(2).value = sameD.VendName;
    sheet.getRow(13).getCell(7).value = 'Date:';
    sheet.getRow(13).getCell(8).value = formatDate(sameD.RoDate);
    sheet.getRow(13).getCell(1).value = 'Subject :';
    sheet.getRow(13).getCell(2).value = sameD.SubjectDetail;
    sheet.getRow(14).getCell(1).value = 'Hue :';
    sheet.getRow(14).getCell(2).value = (sameD.Hue == 'B') ? 'B / W' : 'Coloured';
    
    let arr = ['CAPTION', 'NEWSPAPER / PUBLICATION', 'EDITIONS / SUB-EDITIONS / PACKAGE', 'RATES', 'SIZE'];
    for (let i=0; i<arr.length; i++) sheet.getRow(16).getCell(i+1).value = arr[i];
    sheet.getRow(16).getCell(8).value = 'DATES';
    sheet.getRow(16).getCell(9).value = 'DAY';

    sheet.getRow(17).getCell(4).value = 'SQCM';
    sheet.getRow(17).getCell(5).value = 'W';
    sheet.getRow(17).getCell(8).value = 'DD/MM/YY';

    if (sameD.AdType == 'D') {
        sheet.getRow(17).getCell(6).value = 'x';
        sheet.getRow(17).getCell(7).value = 'H';
    }
    else sheet.getRow(17).getCell(7).value = 'LINES';

    let a = fillTable(sheet, 18, sameD, diffD, paperMap, cityMap);
    let idx = a[0] + 2, gross = a[1];
    sheet.getRow(idx).getCell(1).value = 'Discount | Rates confirmed by:';

    arr = [`Special Discount: ${sameD.SplDis}%`, 'GROSS VALUE', 'ADDL DISCOUNT', 'T. DISCOUNT', 'NET AMT'];
    for (let i = 0; i < arr.length; i++) sheet.getRow(idx + 1).getCell(i+1).value = arr[i];
    sheet.getRow(idx + 1).getCell(8).value = 'GST';
    sheet.getRow(idx + 1).getCell(9).value = 'NET PAYABLE';

    let addl = gross * sameD.SplDis * 0.01;
    let trade = (gross - addl) * sameD.TradeDis * 0.01;
    let net = gross - addl - trade;
    let gst = net * compD.IGst * 0.01;

    sheet.getRow(idx + 2).getCell(1).value = `Trade Discount / AC  : ${sameD.TradeDis}%`;
    arr = [gross, addl, trade, net];
    for (let i = 0; i < arr.length; i++) sheet.getRow(idx + 2).getCell(i+2).value = commaSeparated(arr[i]) + '.00';
    sheet.getRow(idx + 2).getCell(8).value = commaSeparated(gst) + '.00';
    sheet.getRow(idx + 2).getCell(9).value = commaSeparated(net + gst) + '.00';

    sheet.getRow(idx + 3).getCell(1).value = `POSITION: ${sameD.Position}`;
    sheet.getRow(idx + 3).getCell(3).value = 'Material : Attached in email';

    sheet.getRow(idx + 4).getCell(1).value = 'Special Instructions:';
    sheet.getRow(idx + 4).getCell(2).value = sameD.Spl1 != null ? sameD.Spl1 : '';

    sheet.getRow(idx + 5).getCell(2).value = sameD.Spl2 != null ? sameD.Spl2 : '';

    sheet.getRow(idx + 6).getCell(1).value = 'Payment will be made as per INS rules (within 60 days from the last date of the month in which the ads has / have published)';

    let st1 = "Terms and Conditions : No alternation in ReleaseOrder will be accepted. Send your bill in duplicate along with copy of this Release Order immediately on publication of ";
    let st2 = "the advertisement to enable us to process the bill(s) for  payment as per INS rules.  The advertisement should be appeared according to the actual size of the advertisement / material supplied.  Follow our layout in case of translation of the matter for publiction the ad in newspaper's language if instructed.  Do not publish two advertisements of one client / product on same page / issue unless specially instructed.  All disputes are subject to the jursdiction of Delhi Courts only.";
    sheet.getRow(idx + 7).getCell(1).value = st1 + st2;

    let st3 = '"The contract value is exclusive of all applicable Indirect taxes in India viz. Service tax, VAT, GST etc. and the said taxes (if applicable) will be charged and recovered over and above the contract price."';
    sheet.getRow(idx + 8).getCell(1).value = st3;

    sheet.getRow(idx + 9).getCell(1).value = `for ${compD.Name}`;

    sheet.getRow(idx + 9).getCell(4).value = 'RO SENT';
    sheet.getRow(idx + 9).getCell(7).value = 'CONFIRMED';

    sheet.getRow(idx + 10).getCell(3).value = 'Approved By';
    sheet.getRow(idx + 10).getCell(4).value = 'MATERIAL SENT';
    sheet.getRow(idx + 10).getCell(7).value = 'CONFIRMED';

    sheet.addImage(imageId1, {
        tl: { col: 0, row: idx+9 },
        ext: { width: 150, height: 50 }
    });

    sheet.getRow(idx + 13).getCell(1).value = 'Media Executive';
    sheet.getRow(idx + 14).getCell(1).value = sameD.Matter;

    styling1Ro(sheet, idx);
}

function styling1Ro(sheet, idx) {
    let r = [1, 2, 3, 4, 5, 6, 11, 16, idx + 1, idx + 2, idx + 7, idx + 14];
    let c1 = [4, 9, 3, 9, 2, 4, 1, 5, 5, 5, 1, 1];
    let c2 = [9, 9, 9, 9, 9, 9, 6, 7, 7, 7, 9, 9];
    for (let i in r) sheet.mergeCells(r[i], c1[i], r[i], c2[i]);

    r = [3, 5, 5];
    let c = [1, 4, 2];
    for (let i in r) sheet.getRow(r[i]).getCell(c[i]).style = { font: { bold: true, underline: true, size: 8 } };

    r = [2, 3, 4, 5, 7], c = [9, 3, 9, 1, 1];
    for (let i in r) sheet.getRow(r[i]).getCell(c[i]).style = { font: { size: 8 } };

    r = [10, 11, 12, 12, 13, 13, 14], c = [1, 1, 1, 7, 1, 7, 1];
    for (let i in r) sheet.getRow(r[i]).getCell(c[i]).style = { font: { size: 9 } };

    r = [12, 12, 13, 13, 14], c = [2, 8, 2, 8, 2];
    for (let i in r) sheet.getRow(r[i]).getCell(c[i]).style = { font: { bold: true, size: 10 } };

    sheet.getRow(1).getCell(4).style = { font: { bold: true, size: 11, name: 'Aero' } };
    sheet.getRow(6).getCell(1).style = { font: { bold: true, size: 12 } };
    sheet.getRow(11).getCell(7).style = { font: { bold: true, size: 14, name: 'Arial Black' } };

    for(let i=1; i<=5; i++) for(let j=2; j<=9; j++) sheet.getRow(i).getCell(j).alignment = { horizontal: 'right' };
    
    sheet.getRow(16).font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 8 };
    for(let i of [16, 17]) {
        sheet.getRow(i).getCell(4).alignment = { horizontal: 'right' };
        for(let j=5; j<=9; j++) sheet.getRow(i).getCell(j).alignment = { horizontal: 'center' };
    }
    sheet.getRow(17).font = { bold: true, size: 10 };
    for (let i = 1; i <= 9; i++) {
        sheet.getRow(16).getCell(i).fill = {
            type: 'pattern',
            pattern: 'solid',
            bgColor: { argb: '255000000' }
        };
    }
    for (let i = 1; i <= 9; i++) {
        sheet.getRow(17).getCell(i).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFffcccc' }
        };
    }

    for (let i = 18; i <= idx; i++) {
        for (let j = 1; j < 9; j++) {
            sheet.getRow(i).getCell(j).style = { font: { bold: true, size: 9 } };
            if (j <= 3) sheet.getRow(i).getCell(j).alignment = { horizontal: 'left' };
            else if (j == 4) sheet.getRow(i).getCell(j).alignment = { horizontal: 'right' };
            else sheet.getRow(i).getCell(j).alignment = { horizontal: 'center' };
        }
    }
    for (let i = 18; i <= idx; i++) sheet.getRow(i).getCell(9).style = { font: { size: 8 } };

    sheet.getRow(idx+1).getCell(1).style = { font: { bold: true, size: 8 } };
    for (let i = 2; i <= 9; i++) sheet.getRow(idx + 1).getCell(i).style = { font: { bold: true, size: 8, color: { argb: 'FFff0000' } }, alignment: { horizontal: 'right' } };
    
    sheet.getRow(idx + 2).getCell(1).style = { font: { bold: true, size: 8 } };
    for (let i = 2; i <= 9; i++) sheet.getRow(idx + 2).getCell(i).style = { font: { bold: true, size: 10 }, alignment: { horizontal: 'right' } };

    for (let i = 2; i <= 9; i++) sheet.getRow(idx + 3).getCell(i).style = { font: { bold: true, size: 10 } };

    sheet.getRow(idx + 4).getCell(1).style = { font: { bold: true, size: 9 } };
    sheet.getRow(idx + 4).getCell(2).style = { font: { bold: true, size: 10, color: { argb: 'FFff0000' } } };
    sheet.getRow(idx + 5).getCell(2).style = { font: { bold: true, size: 10, color: { argb: 'FFff0000' } } };
    sheet.getRow(idx + 6).getCell(1).style = { font: { size: 8 } };
    sheet.getRow(idx + 7).getCell(1).style = { font: { size: 7 }, alignment: { wrapText: true } };
    sheet.getRow(idx + 7).height = 52;
    sheet.getRow(idx + 8).getCell(1).style = { font: { size: 6 } };

    sheet.getRow(idx + 9).getCell(1).style = { font: { size: 7 } };
    for (let i = idx + 9; i <= idx + 10; i++) for (let j = 3; j <= 7; j++) sheet.getRow(i).getCell(j).style = { font: { size: 6, color: { argb: 'FF909090' } } };
    
    for (let i = 7; i <= 9; i++) {
        sheet.getRow(11).getCell(i).border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' }
        };
    }

    for(let i=3; i<=7; i++) {
        sheet.getRow(idx+9).getCell(i).border = { right: { style: 'thin' } };
        sheet.getRow(idx + 10).getCell(i).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    }
    for(let i of [9, 10]) sheet.getRow(idx + i).getCell(8).border = { bottom: { style: 'thin' } };

    sheet.getRow(idx + 13).getCell(1).style = { font: { size: 7 } };
    sheet.getRow(idx + 14).getCell(1).alignment = { wrapText: true };
    sheet.getRow(idx + 14).height = 40;
}

function summPart(sheet, sameD, diffD, paperMap, cityMap) {
    sheet.getRow(47).getCell(5).value = sameD.VendName;
    sheet.getRow(49).getCell(1).value = `RO - ${sameD.RoNo}`;
    sheet.getRow(51).getCell(1).value = sameD.VendName;
    sheet.getRow(52).getCell(1).value = sameD.SubjectDetail;
    sheet.getRow(53).getCell(1).value = sameD.Position;

    let head = ['CAPTION', 'NEWSPAPER', 'EDITIONS / SUB-EDITIONS / PACKAGE', 'RATES', 'SIZE', '', '', 'DATE', 'DAY'];
    for (let i = 0; i < head.length; i++) sheet.getRow(54).getCell(i + 1).value = head[i];
    
    let a = fillTable(sheet, 55, sameD, diffD, paperMap, cityMap);
    let idx = a[0];
    sheet.getRow(idx + 1).getCell(1).value = sameD.Matter;

    styling1(sheet, head.length, idx);
}

function styling1(sheet, hLen, tLen) {
    sheet.mergeCells(47, 5, 48, 9);
    sheet.mergeCells(49, 5, 50, 9);
    sheet.mergeCells(54, 5, 54, 7);
    sheet.mergeCells(tLen + 1, 1, tLen + 1, 9);

    sheet.getRow(47).font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(49).font = { name: 'Arial Black', size: 18, bold: true };
    for (let i = 50; i <= 53; i++) sheet.getRow(i).font = { bold: true, underline: true };
    sheet.getRow(54).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    sheet.getRow(47).getCell(5).alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getRow(54).getCell(5).alignment = { horizontal: 'center' };
    for (let i = 55; i < tLen; i++) {
        for (let j = 4; j <= 8; j++) sheet.getRow(i).getCell(j).alignment = { horizontal: 'center' };
    }

    sheet.getCell('E47').fill = {
        type: 'pattern',
        pattern: 'solid',
        bgColor: { argb: '255000000' }
    };
    for (let i = 0; i < hLen; i++) {
        sheet.getRow(54).getCell(i + 1).fill = {
            type: 'pattern',
            pattern: 'solid',
            bgColor: { argb: '255000000' }
        };
    }

    for (let i = 49; i <= 50; i++) {
        for(let j = 5; j <= 9; j++)
        sheet.getRow(i).getCell(j).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    }
    sheet.getRow(tLen + 1).getCell(1).alignment = { wrapText: true };
    sheet.getRow(tLen + 1).height = 40;
}

function fillTable(sheet, idx, sameD, diffD, paperMap, cityMap) {
    let gross = 0;
    for (let obj of diffD) {
        let day = days[new Date(obj.DateP).getDay()];
        sheet.getRow(idx).getCell(1).value = obj.Caption;
        sheet.getRow(idx).getCell(2).value = paperMap[obj.ShortName];
        let edi_sub_pkg = cityMap[obj.EditionCode];
        if (obj.SubE != '') edi_sub_pkg += ' / ' + obj.SubE;
        if (sameD.Package != '') edi_sub_pkg += ' / ' + sameD.Package;
        sheet.getRow(idx).getCell(3).value = edi_sub_pkg;
        sheet.getRow(idx).getCell(4).value = obj.RatePR;
        sheet.getRow(idx).getCell(5).value = obj.Width;
        sheet.getRow(idx).getCell(8).value = formatDate(obj.DateP);
        sheet.getRow(idx).getCell(9).value = day;

        if (sameD.AdType == 'D') {
            sheet.getRow(idx).getCell(6).value = 'x';
            sheet.getRow(idx).getCell(7).value = obj.Height;
            gross += obj.RatePR * obj.Width * obj.Height;
        }
        else {
            sheet.getRow(idx).getCell(7).value = 'LINES';
            gross += parseFloat(obj.RatePR);
        }
        idx++;
    }
    return [idx, gross];
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
        sheet.getRow(idx).getCell(9).value = sameD.Position;
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
    sheet.mergeCells(tLen+2, 1, tLen+2, 9);

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
            fgColor: { argb: 'FF2F20FF' }
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
        for(let j=1; j<=9; j++) {
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
        fgColor: { argb: 'FF2F20FF' }
    };
}

function commaSeparated(num) {
    return num.toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

function formatDate(date) {
    var arr = date.split('-')
    return arr[2] + "-" + arr[1] + "-" + arr[0];
}

module.exports = { createRoExcel };