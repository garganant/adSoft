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
            top: 10,
            bottom: 10,
            left: 50,
            right: 20
        }
    });
    
    for (var i = 0; i < bills.length; i++) {
        limit = 8, y = 198;
        if (i != 0) doc.addPage();
        generateHeader(doc, cData);
        generateCustomerInfo(doc, bills[i][3]['BillNo'], bills[i][3]['BillDate'], bills[i][0], cData.FY, bills[i][1], bills[i][4], bills[i][5], btype);
        let gross = generateRoTable(doc, bills[i][2], bills[i][3], bills[i][4]['LSplDis'], rupee);
        generateFooter(doc, cData, bills[i][0].Status, bills[i][3], parseFloat(bills[i][3]['Advance']), gross);
    }

    doc.end();
    let pt = `${cData.File_path}B${bills[0][3]['BillNo']}.pdf`;
    doc.pipe(fs.createWriteStream(pt));
    let child = new PDFWindow({ title: 'File', autoHideMenuBar: true });
    child.loadURL(pt);
}

function generateHeader(doc, compD) {
    doc
        .fillColor('blue')
        .fontSize(12)
        .font("Helvetica-Bold")
        .text(compD.Name, { align: 'right' });

    doc
        .fillColor('black')
        .fontSize(6)
        .font("Helvetica")
        .text(compD.Address, { align: 'right' })
        .moveDown(0.3)
        .text(`Tel. ${compD.Phone} Fax: ${compD.Fax} Cell: ${compD.Mobile}`, { align: 'right' })
        .moveDown(0.2)
        .text(`Email: ${compD.Email} Website: ${compD.Website}`, { align: 'right' })

    doc.moveDown();
}

function generateCustomerInfo(doc, billNo, bDate, vendD, FY, subject, obj, custTparty, btype) {
    let x = [439, 498, 579], yH = [85, 122], yV = [97, 109, 122];
    fillInv(doc, x, yH, yV, 1);
    yH = [127, 163], yV = [127, 138, 150, 163];

    doc
        .moveDown(1)
        .text(obj['Salutation'], { align: 'left' })
        .fontSize(8)
        .font("Helvetica-Bold")
        .text(vendD.Name)
        .font("Helvetica")
        .text(vendD.Street1)
        .text(vendD.Street2)
        .text(`${vendD.City} - ${vendD.Pincode}`)
        .text(vendD.State)
        .moveUp(4.6)
        .fontSize(14)
        .font("Helvetica-Bold")
        .fillColor('white')
        .text('TAX INVOICE', 465, 69)
        .moveDown(0.5)
        .fontSize(7)
        .fillColor('black')
        .text('No.', 440, 88)
        .text(FY + ' / ' + billNo, 501, 88)
        .text('Date:', 440, 100)
        .text(formatDate(bDate), 501, 100)
        .text('Place of Supply', 440, 112)
        .text(vendD.State, 501, 112)
        .moveDown(2)
        .font("Helvetica-Bold")
        .text('GST NUMBER :', 50)
        .font("Helvetica")
        .moveUp()
        .text(vendD.Gstin, 105);

    let sub = subject;
    if (custTparty != "") sub += `   | ${custTparty}`;
    if (btype == 1 && obj.Prospect != "") sub+= ` | ${obj.Prospect}`;

    doc
        .font("Helvetica-Bold")
        .text(`Subject : ${sub}`, 50, 165,);

    if (btype == 2) {
        if(obj.Attention != "") {
            doc
                .font("Helvetica-Bold")
                .text("Kind Attention :", 50, 150)
                .text(obj.Attention, 105, 150);
        }

        if (obj.AdRef != "") {
            doc
                .font("Helvetica")
                .text("Ad Reference :", doc.widthOfString(sub) + 170, 165, { underline: true })
                .font("Helvetica-Bold")
                .text(obj.AdRef, doc.widthOfString(sub) + 218, 165, { bold: true });
        }
    }
    else if(btype == 3) {
        doc
            .font("Helvetica")
            .text('Product', 440, 130)
            .font("Helvetica-Bold")
            .text(obj.Product, 501, 130);
    }

    if(btype == 2 || btype == 3) {
        fillInv(doc, x, yH, yV, btype);
        doc
            .font("Helvetica")
            .text('Bill Month', 440, 141)
            .font("Helvetica-Bold")
            .text(obj.Month, 501, 141)
            .font("Helvetica")
            .text('Activity', 440, 153)
            .font("Helvetica-Bold")
            .text(obj.Activity, 501, 153)
            .moveDown(2.5);
    }
        
    doc
        .moveDown(0.5)
        .text('Being the charges towards selling of space in Print Media as per detail given below:', 50)
}

function generateRoTable(doc, arr, sData, SplDis, rupee) {
    generateTableRow(doc, "PUBLICATION (S)", "      DATE", "  SIZE", "SPACE", " RATE", "AMOUNT", sData.AdType);
    y = 211;
    let sz = sData.AdType == 'D' ? "W  x  H": "W    LINES";
    generateTableRow(doc, "Editions", "DD/MM/YYYY", sz, "SQ. CM.", "SQ. CM.", "     INR", sData.AdType);
    doc.image(rupee, 569, 201, { scale: 0.02 });

    y = 230 , amt = 0;
    for(let p of arr) {
        sz = sData.AdType == 'D' ? `${p[3]}  x  ${p[4]}` : `${p[3]}   LINES`;
        let space = sData.AdType == 'D' ? p[3] * p[4] : `${p[3]}   LINES`;
        let tAmt = sData.AdType == 'D' ? p[3] * p[4] * p[5] : p[5];
        generateTableRow(doc, `  ${p[0]}`, ` ${formatDate(p[2])}`, sz, space, (p[5]).toFixed(2), commaSeparated(tAmt, 0) + '.00', sData.AdType);
        y+= 10;
        generateTableRow(doc, `          ${p[6]}    (${p[7]})`, "", "", "", "", "", sData.AdType);
        y+= 18;
        amt+= tAmt;
    }
    y = 560;
    generateVr(doc);
    generateHr(doc, 48, 580, y-1);
    y+= 3;
    generateTableRow(doc, "", "GRAND TOTAL", "", "", "", commaSeparated(amt, 0) + '.00', sData.AdType);
    y+= 10;
    generateTableRow(doc, "", "LESS: Other Dr/Cr Adjustments", "", "", "", "   " + commaSeparated(SplDis, 0), sData.AdType);
    y+= 10;
    generateHr(doc, 48, 580, y - 1);
    y+= 3;

    return Math.round(amt - SplDis);
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
        .fillColor('#9a0000')
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
        .font("Helvetica-Bold")
        .text('GROSS AMOUNT', 396)
        .moveUp()
        .text(g, 573 - doc.widthOfString(g))
        .moveDown(0.5)
        .font("Helvetica")
        .text('CGST', 396)
        .moveUp()
        .text(sData.CGst + ' %', 450)
        .moveDown(0.5)
        .text('SGST', 396)
        .moveUp()
        .text(sData.SGst + ' %', 450)
        .moveDown(0.5)
        .text('IGST', 396)
        .moveUp()
        .text(sData.IGst + ' %', 450)
        .moveDown(0.5)
        .text('CESS', 396)
        .moveDown(0.5)
        .font("Helvetica-Bold")
        .text('Total Amount', 396)
        .moveUp()
        .text(total, 573 - doc.widthOfString(total))
        .moveDown(0.5)
        .font("Helvetica")
        .text('Less: Advance / Credit Adjustments', 396)
        .moveUp()
        .text(adv, 573 - doc.widthOfString(adv))
        .moveDown(0.5)
        .font("Helvetica-Bold")
        .text('Net Amount Payable', 396)
        .moveUp()
        .text(net, 573 - doc.widthOfString(net))
        .font("Helvetica")
        .moveUp(10.5);
        
    if(Status == 'L') {
        let cgst = commaSeparated(gross * sData.CGst * 0.01, 2);
        let sgst = commaSeparated(gross * sData.SGst * 0.01, 2);
        doc
            .moveDown(0.5)
            .text(cgst, 573 - doc.widthOfString(cgst))
            .moveDown(0.5)
            .text(sgst, 573 - doc.widthOfString(sgst))
            .moveDown(0.5)
            .text('-', 570)
            .moveDown(6.8);
    }
    else {
        doc
            .text('-', 570)
            .moveDown(0.5)
            .text('-', 570)
            .moveDown(0.5)
            .text(igst, 573 - doc.widthOfString(igst))
            .moveDown(7.1);
    }

    doc
        .fontSize(8)
        .font("Helvetica-Bold")
        .text(words, 50)
        .moveDown(0.5)
        .fontSize(6)
        .fillColor('#9a0000')
        .text('MSME REGN:', 50)
        .moveUp()
        .fillColor('black')
        .text(cData.MsmeRegn, 92)
        .moveUp()
        .fillColor('#9a0000')
        .text('|    CIN :', 155)
        .fillColor('black')
        .moveUp()
        .text(cData.Cin, 180)
        .moveUp()
        .text(`for ${cData.Name}`, { align: 'right' })
        .fillColor('#9a0000')
        .text('GST No :', 50)
        .fillColor('black')
        .moveUp()
        .text(cData.Gstin, 77)
        .moveUp()
        .fillColor('#9a0000')
        .text('HSN CODE :', 170)
        .moveUp()
        .fillColor('black')
        .text(cData.HsnCode, 206)
        .fillColor('#9a0000')
        .text('PAN :', 50)
        .moveUp()
        .fillColor('black')
        .text(cData.Pan, 68)
        .moveUp()
        .fillColor('#9a0000')
        .text('|   TAN :', 110)
        .moveUp()
        .fillColor('black')
        .text(cData.Tan, 135)
        .moveUp()
        .fillColor('#9a0000')
        .text('|   UDYAM :', 180)
        .fillColor('black')
        .moveUp()
        .text(cData.Udyam, 215)
        .moveDown()
        .font("Helvetica")
        .text(s1, 50)
        .text(s2)
        .moveUp()
        .fillColor('#9a0000')
        .text('GST Particulars ', doc.widthOfString(s1) - 36)
        .moveUp()
        .fillColor('black')
        .text('will not be', doc.widthOfString(s1) + 10)
        .text('entertained', 50)
        .moveUp()
        .fillColor('#9a0000')
        .text('after seven days of the bill.', 83)
        .fillColor('black')
        .moveUp()
        .text('Authorised Signatory', { align : 'right' })
        .moveDown(0.5)
        .text('Prepared by :', 50)
        .text('', 87)
        .moveUp()
        .text('                                             ', { underline: true })
        .moveUp(0.8)
        .text('Checked by :', 177)
        .text('', 212)
        .moveUp()
        .text('                                             ', { underline: true })
        .fontSize(7)
        .font("Helvetica-Bold")
        .text('NEWSPAPER CUTTINGS ENCLOSED', 50, 768, { underline: true })
        .moveDown()
        .text('E&OE')
        .font("Helvetica")
        .moveUp(1.05)
        .text('BH / CR / SP / COL', 80);

    if (sData.Matter != "") {
        doc
            .text('', 49)
            .fillColor('black')
            .moveDown(1)
            .text(sData.Matter, { align: 'justify' });
    }

    lines(doc);
}

function generateTableRow(doc, publication, date, size, space, rate, amount, AdType) {
    doc
        .font("Helvetica")
        .fillColor('black')
        .lineWidth(12);

    if (y == 198 || y == 211) {
        if(y == 198) fillBackground(doc, y+2);
        else fillBackground(doc, y+3);
        doc
            .font("Helvetica-Bold")
            .fillColor('white');
    }
    if (date != "" && y > 211) doc.font("Helvetica-Bold");

    doc
        .fontSize(7.2)
        .text(publication, 50, y)
        .text(date, 285, y);

    if (y == 198 || y == 211) {
        if (y == 198) doc.text(size, 354, y);
        else if (y == 211 && AdType == 'D') doc.text(size, 354, y);
        doc
            .text(space, 410, y)
            .text(rate, 464, y)
            .text(amount, 533, y);
    }
    else {
        if (AdType == 'D') doc.text(size, 352, y, { width: 30, align: 'center' });
        else doc.text(size, 381 - doc.widthOfString(size), y);
        doc
            .text(space, 442 - doc.widthOfString('' + space), y)
            .text(rate, 506 - doc.widthOfString(rate), y)
            .text(amount, 573 - doc.widthOfString(amount), y);
    }
}

function fillInv(doc, x, yH, yV, btype) {
    if(btype == 1) {
        doc
            .lineWidth(22)
            .lineCap('butt')
            .moveTo(439, 74)
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
            .moveTo(439, yV[i])
            .lineTo(579, yV[i])
            .stroke();
    }
}

function fillBackground(doc, y) {
    let mt = [48, 275, 339, 395, 446, 512];
    let lt = [274, 338, 394, 445, 511, 580];

    for (let i in mt) {
        doc
            .lineWidth(13)
            .lineCap('butt')
            .moveTo(mt[i], y)
            .lineTo(lt[i], y)
            .stroke();
    }
}

function generateVr(doc) {
    let x = [48, 275, 338, 395, 446, 512, 580];
    for (let i of x) {
        doc
            .strokeColor("black")
            .lineWidth(0.1)
            .moveTo(i, 198)
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
            .moveTo(i, 559)
            .lineTo(i, 699)
            .stroke();
    }
    doc
        .strokeColor("black")
        .lineWidth(0.1)
        .moveTo(395, 582)
        .lineTo(395, 684)
        .stroke();
    doc
        .strokeColor("black")
        .lineWidth(0.1)
        .moveTo(512, 549)
        .lineTo(512, 684)
        .stroke();

    generateHr(doc, 395, 580, 633);
    generateHr(doc, 395, 580, 671);
    generateHr(doc, 48, 580, 684);
    generateHr(doc, 48, 580, 699);

    doc
        .strokeColor('#9a0000')
        .rect(48, 780, 100, 13)
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
    return num.toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d })
}

function formatDate(date) {
    var arr = date.split('-')
    return arr[2] + "-" + arr[1] + "-" + arr[0];
}

module.exports = { createBill };