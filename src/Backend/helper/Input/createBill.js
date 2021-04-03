const fs = require("fs");
const PDFWindow = require('electron-pdf-window');
const PDFDocument = require("pdfkit");
const { ToWords } = require('to-words');
const toWords = new ToWords({
    localeCode: 'en-IN',
    converterOptions: {
        currency: true,
        ignoreDecimal: false,
        ignoreZeroCurrency: false,
    }
});
let limit, y;

function createBill(cData, rupee, btype, bills) {
    let doc = new PDFDocument({ size: "A4", margins: {
            top: 20,
            bottom: 20,
            left: 50,
            right: 20
        }
    });
    
    for (var i = 0; i < bills.length; i++) {
        limit = 8, y = 195;
        if (i != 0) doc.addPage();
        generateHeader(doc, cData);
        generateCustomerInfo(doc, bills[i][3]['BillNo'], bills[i][3]['BillDate'], bills[i][0], cData.FY, bills[i][1], bills[i][4], btype);
        let gross = generateRoTable(doc, bills[i][2], bills[i][3], bills[i][4]['LSplDis'], rupee);
        generateFooter(doc, cData, bills[i][0].Status, bills[i][3], parseFloat(bills[i][3]['Advance']), gross);
    }

    doc.end();
    doc.pipe(fs.createWriteStream(cData.File_path + 'File.pdf'));
    let child = new PDFWindow({ title: 'File', autoHideMenuBar: true });
    child.loadURL(cData.File_path + 'File.pdf');
}

function generateHeader(doc, compD) {
    doc
        .fillColor('blue')
        .fontSize(12)
        .font("Times-Bold")
        .text(compD.Name, { align: 'right' });

    doc
        .fillColor('black')
        .fontSize(8)
        .font("Times-Roman")
        .text(compD.Address, { align: 'right' })
        .text(`Tel. ${compD.Phone} Fax: ${compD.Fax} Cell: ${compD.Mobile}`, { align: 'right' })
        .text(`Email: ${compD.Email} Website: ${compD.Website}`, { align: 'right' })

    doc.moveDown();
}

function generateCustomerInfo(doc, billNo, bDate, vendD, FY, subject, obj, btype) {
    let x = [459, 508, 579], yH = [85, 122], yV = [97, 109, 122];
    fillInv(doc, x, yH, yV, 1);
    yH = [127, 163], yV = [127, 138, 150, 163];

    doc
        .moveDown(1)
        .text('M/s / Mr. / Ms.', { align: 'left' })
        .font("Times-Bold")
        .text(vendD.Name)
        .font("Times-Roman")
        .text(vendD.Street1)
        .text(vendD.Street2)
        .text(`${vendD.City} - ${vendD.Pincode}`)
        .fillColor('#FF1493')
        .text(vendD.State)
        .fillColor('black')
        .moveUp(7)
        .fontSize(14)
        .font("Times-Bold")
        .fillColor('white')
        .text('TAX INVOICE', 472)
        .moveDown(0.5)
        .fontSize(7)
        .fillColor('black')
        .text('No.', 460, 88)
        .text(FY + '/' + billNo, 510, 88)
        .text('Date:', 460, 100)
        .text(formatDate(bDate), 510, 100)
        .text('Place of Supply', 460, 112)
        .font("Times-Roman")
        .text(vendD.State, 510, 112)
        .font("Times-Bold")
        .moveDown(2)
        .fillColor('#FF1493')
        .text('GST NUMBER :', 50)
        .moveUp()
        .fillColor('black')
        .text(vendD.Gstin, 102);

    let sub = subject;
    if(btype == 1) {
        doc
            .moveUp()
            .fillColor('#FF1493')
            .text('PAN :', 200)
            .moveUp()
            .fillColor('black')
            .text(vendD.Pan, 220);

        if(obj.Prospect != "") sub+= ` | Prospect No. ${obj.Prospect}`;
    }

    doc
        .font("Times-Roman")
        .text("Subject :", 50, 165, { underline: true })
        .font("Times-Bold")
        .text(sub, 102, 165, { underline: true });

    if (btype == 2) {
        if(obj.Attention != "") {
            doc
                .font("Times-Bold")
                .text("Kind Attention :", 50, 155)
                .text(obj.Attention, 102, 155);
        }

        if (obj.AdRef != "") {
            doc
                .font("Times-Roman")
                .text("Ad Reference :", doc.widthOfString(sub) + 170, 165, { underline: true })
                .font("Times-Bold")
                .text(obj.AdRef, doc.widthOfString(sub) + 212, 165, { bold: true });
        }
    }
    else if(btype == 3) {
        doc
            .font("Times-Roman")
            .text('Product', 460, 130)
            .font("Times-Bold")
            .text(obj.Product, 510, 130);
    }

    if(btype == 2 || btype == 3) {
        fillInv(doc, x, yH, yV, btype);
        doc
            .font("Times-Roman")
            .text('Bill Month', 460, 141)
            .font("Times-Bold")
            .text(obj.Month, 510, 141)
            .font("Times-Roman")
            .text('Activity', 460, 153)
            .font("Times-Bold")
            .text(obj.Activity, 510, 153)
            .moveDown(1.5);
    }
        
    doc
        .moveDown(0.5)
        .text('Being the charges towards selling of space in Print Media as per detail given below:', 50)
}

function generateRoTable(doc, arr, sData, SplDis, rupee) {
    generateTableRow(doc, "PUBLICATION (S)", " Ref.", "       DATE", "  SIZE", "SPACE", "RATE", "AMOUNT");
    y = 205;
    let sz = sData.AdType == 'D' ? "W  x  H": "W    LINES";
    generateTableRow(doc, "EDITIONS", "", "DD/MM/YYYY", sz, "SQ. CM.", "SQ. CM.", "  INR");
    doc.image(rupee, 567, 195, { scale: 0.03 });

    y = 220 , amt = 0;
    for(let p of arr) {
        sz = sData.AdType == 'D' ? `${p[3]}  x  ${p[4]}` : `${p[3]}   LINES`;
        let tAmt = sData.AdType == 'D' ? p[3] * p[4] * p[5] : p[5];
        generateTableRow(doc, p[0], p[1], formatDate(p[2]), sz, p[3] * p[4], (p[5]).toFixed(2), commaSeparated(tAmt) + '.00');
        y+= 10;
        generateTableRow(doc, p[6], "", "", "", "", "", "");
        y+= 18;
        amt+= tAmt;
    }
    y = 550;
    generateVr(doc);
    generateHr(doc, 48, 580, y-1);
    y+= 3;
    generateTableRow(doc, "", "", "GRAND TOTAL", "", "", "", commaSeparated(amt, 0)+'.00');
    y+= 10;
    let dis = amt * SplDis * 0.01;
    generateTableRow(doc, "", "", "LESS: SPECIAL PACKAGE DISCOUNTS & OTHER  ADJUSTMENTS", "", "", "", "   " + commaSeparated(dis, 0) + '.00');
    y+= 10;
    generateHr(doc, 48, 580, y - 1);
    y+= 3;

    return Math.round(amt - dis);
}

function generateFooter(doc, cData, Status, sData, adv, gross) {
    let g = commaSeparated(gross, 0) + '.00';
    let igst = gross * sData.IGst * 0.01;
    let total = gross + igst;
    let net = total - adv;
    let words = toWords.convert(net, { currency: true });
    net = commaSeparated(net, 2);
    igst = commaSeparated(igst, 2);
    total = commaSeparated(total, 2);
    adv = commaSeparated(adv, 2);
    let s1 = 'Interest @ 24% p.a. will be charged if the payment is not made within 7 days from';
    let s2 = 'the date of bill. Any objection regarding the bill / ';

    doc
        .fillColor('#FF1493')
        .text('BANK DETAIL FOR ONLINE PAYMENT', 50, y, { bold: true, underline: true })
        .moveDown(0.5)
        .fillColor('black')
        .text('Name')
        .moveUp()
        .text(`: ${cData.BCName}`, 100)
        .moveDown(0.5)
        .text('Bank Name', 50)
        .moveUp()
        .text(`: ${cData.Bank}`, 100)
        .moveDown(0.5)
        .text('Account No.', 50)
        .moveUp()
        .text(`: ${cData.AccNo}`, 100)
        .moveDown(0.5)
        .text('Branch', 50)
        .moveUp()
        .text(`: ${cData.Branch}` , 100)
        .moveDown(0.5)
        .text('IFSC CODE', 50)
        .moveUp()
        .text(`: ${cData.Ifsc}`, 100)
        .moveUp(8.5)
        .font("Times-Bold")
        .text('GROSS AMOUNT', 400)
        .moveUp()
        .text(g, 573 - doc.widthOfString(g))
        .moveDown(0.5)
        .font("Times-Roman")
        .text('CGST', 400)
        .moveUp()
        .text(sData.CGst + ' %', 450)
        .moveDown(0.5)
        .text('SGST', 400)
        .moveUp()
        .text(sData.SGst + ' %', 450)
        .moveDown(0.5)
        .text('IGST', 400)
        .moveUp()
        .text(sData.IGst + ' %', 450)
        .moveDown(0.5)
        .text('CESS', 400)
        .moveDown(0.5)
        .font("Times-Bold")
        .text('Total Amount Payable', 400)
        .moveUp()
        .text(total, 573 - doc.widthOfString(total))
        .moveDown(0.5)
        .font("Times-Roman")
        .text('Less: Advance / Credit Adjustments', 400)
        .moveUp()
        .text(adv, 573 - doc.widthOfString(adv))
        .moveDown()
        .font("Times-Bold")
        .text('Net Amount Payable', 400)
        .moveUp()
        .text(net, 573 - doc.widthOfString(net))
        .font("Times-Roman")
        .moveUp(10.5);
        
    if(Status == 'L') {
        let cgst = commaSeparated(gross * sData.CGst * 0.01, 2);
        let sgst = commaSeparated(gross * sData.SGst * 0.01, 2);
        doc
            .text(cgst, 573 - doc.widthOfString(cgst))
            .moveDown(0.5)
            .text(sgst, 573 - doc.widthOfString(sgst))
            .moveDown(0.5)
            .text('-', 570);
    }
    else {
        doc
            .text('-', 570)
            .moveDown(0.5)
            .text('-', 570)
            .moveDown(0.5)
            .text(igst, 573 - doc.widthOfString(igst));
    }

    doc
        .moveDown(7)
        .fontSize(8)
        .font("Times-Bold")
        .text(words, 50)
        .moveDown(0.5)
        .fontSize(6)
        .fillColor('#FF1493')
        .text('MSME REGN:', 50)
        .moveUp()
        .fillColor('black')
        .text(cData.MsmeRegn, 92)
        .moveUp()
        .fillColor('#FF1493')
        .text('|    CIN :', 155)
        .fillColor('black')
        .moveUp()
        .text(cData.Cin, 180)
        .moveUp()
        .text(`for ${cData.Name}`, { align: 'right' })
        .fillColor('#FF1493')
        .text('GST No :', 50)
        .fillColor('black')
        .moveUp()
        .text(cData.Gstin, 77)
        .moveUp()
        .fillColor('#FF1493')
        .text('HSN CODE :', 170)
        .moveUp()
        .fillColor('black')
        .text(cData.HsnCode, 206)
        .fillColor('#FF1493')
        .text('PAN :', 50)
        .moveUp()
        .fillColor('black')
        .text(cData.Pan, 68)
        .moveUp()
        .fillColor('#FF1493')
        .text('|   TAN :', 110)
        .moveUp()
        .fillColor('black')
        .text(cData.Tan, 135)
        .moveDown(0.5)
        .font("Times-Roman")
        .text(s1, 50)
        .text(s2)
        .moveUp()
        .fillColor('#FF1493')
        .text('GST Particulars ', doc.widthOfString(s1) - 30)
        .moveUp()
        .fillColor('black')
        .text('will not be', doc.widthOfString(s1) + 10)
        .text('entertained', 50)
        .moveUp()
        .fillColor('#FF1493')
        .text('after seven days of the bill.', 81)
        .fillColor('black')
        .moveUp()
        .text('Authorised Signatory', { align : 'right' })
        .moveDown(0.5)
        .text('Prepared by :', 50)
        .moveUp()
        .text('                                             ', 87, 740, { underline: true })
        .moveUp()
        .text('Checked by :', 177)
        .text('                                             ', 212, 740, { underline: true })
        .fontSize(7)
        .font("Times-Bold")
        .text('NEWSPAPER CUTTINGS ENCLOSED', 50, 750, { underline: true })
        .moveDown()
        .text('E&OE')
        .font("Times-Roman")
        .moveUp(1.05)
        .text('BH / CR / SP / COL', 80);

    lines(doc);
}

function generateTableRow(doc, publication, ref, date, size, space, rate, amount) {
    doc
        .font("Times-Roman")
        .fillColor('black')
        .lineWidth(12);

    if (y == 195 || y == 205) {
        fillBackground(doc, y+3);
        doc.fillColor('white');
    }
    if (date != "" && y > 205) doc.font("Times-Bold");

    doc
        .fontSize(7.2)
        .text(publication, 50, y)
        .text(ref, 238, y)
        .text(date, 285, y)
        .text(size, 354, y);

    if (y == 195 || y == 205) {
        doc
            .text(space, 410, y)
            .text(rate, 484, y)
            .text(amount, 533, y);
    }
    else {
        doc
            .text(space, 408, y)
            .text(rate, 506 - doc.widthOfString(rate), y)
            .text(amount, 573 - doc.widthOfString(amount), y);
    }
}

function fillInv(doc, x, yH, yV, btype) {
    if(btype == 1) {
        doc
            .lineWidth(22)
            .lineCap('butt')
            .moveTo(459, 74)
            .lineTo(580, 74)
            .stroke();
    }

    for (let i of x) {
        doc
            .strokeColor("black")
            .lineWidth(0.1)
            .moveTo(i, yH[0])
            .lineTo(i, yH[1])
            .stroke();
    }

    for (let i in yV) {
        doc
            .strokeColor("black")
            .lineWidth(0.1)
            .moveTo(459, yV[i])
            .lineTo(579, yV[i])
            .stroke();
    }
}

function fillBackground(doc, y) {
    let mt = [48, 232, 275, 339, 395, 446, 512];
    let lt = [231, 274, 338, 394, 445, 511, 580];

    for (let i in mt) {
        doc
            .lineWidth(9)
            .lineCap('butt')
            .moveTo(mt[i], y)
            .lineTo(lt[i], y)
            .stroke();
    }
}

function generateVr(doc) {
    let x = [48, 232, 275, 338, 395, 446, 512, 580];
    for (let i of x) {
        doc
            .strokeColor("black")
            .lineWidth(0.1)
            .moveTo(i, 195)
            .lineTo(i, y - 1)
            .stroke();
    }
}

function lines(doc) {
    let x = [48, 580];
    for(let i of x) {
        doc
            .strokeColor("black")
            .lineWidth(0.1)
            .moveTo(i, 549)
            .lineTo(i, 688)
            .stroke();
    }
    doc
        .strokeColor("black")
        .lineWidth(0.1)
        .moveTo(395, 572)
        .lineTo(395, 674)
        .stroke();
    doc
        .strokeColor("black")
        .lineWidth(0.1)
        .moveTo(512, 549)
        .lineTo(512, 674)
        .stroke();

    generateHr(doc, 395, 580, 633);
    generateHr(doc, 395, 580, 660);
    generateHr(doc, 48, 580, 674);
    generateHr(doc, 48, 580, 688);

    doc
        .strokeColor('#FF1493')
        .rect(48, 763, 100, 12)
        .stroke();
}

function generateHr(doc, x1, x2, y) {
    doc
        .strokeColor('black')
        .lineWidth(0.1)
        .moveTo(x1, y)
        .lineTo(x2, y)
        .stroke();
}

function commaSeparated(num, d) {
    return num.toLocaleString('en-IN', { maximumFractionDigits: d })
}

function formatDate(date) {
    var arr = date.split('-')
    return arr[2] + "-" + arr[1] + "-" + arr[0];
}

module.exports = { createBill };