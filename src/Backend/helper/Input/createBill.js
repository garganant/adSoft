const fs = require("fs");
const PDFWindow = require('electron-pdf-window');
const PDFDocument = require("pdfkit");
const numWords = require('num-words');
let limit = 8;

function createBill(cData, rupee, bills) {
    let doc = new PDFDocument({ size: "A4", margin: 20 });
    
    for (var i = 0; i < bills.length; i++) {
        if (i != 0) doc.addPage();
        generateHeader(doc, cData);
        generateCustomerInfo(doc, bills[i][0], bills[i][1], bills[i][2], cData.FY, bills[i][3]);
        generateRoTable(doc, bills[i][2].Status, bills[i][4], rupee);
        // generateFooter(doc, bills[i][5], cData, bills[i][6]);
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

function generateCustomerInfo(doc, billNo, bDate, vendD, FY, subject) {
    fillInv(doc, 84);

    doc
        .moveDown(2)
        .text('M/s / Mr. / Ms.', { align: 'left' })
        .font("Times-Bold")
        .text(vendD.Name)
        .font("Times-Roman")
        .text(vendD.Street1)
        .text(vendD.Street2)
        .text(`${vendD.City} - ${vendD.Pincode}`)
        .text(vendD.State)
        .moveUp(7)
        .fontSize(14)
        .font("Times-Bold")
        .fillColor('white')
        .text('TAX INVOICE', { align: 'right' })
        .moveDown(0.5)
        .fontSize(8)
        .fillColor('black')
        .text(`No. ${FY}/${billNo}`, 460, 98)
        .text(`Date: ${formatDate(bDate)}`, 460, 110)
        .text(`Place of Supply ${vendD.State}`, 460, 122)
        .moveDown(4)
        .text(`GST: ${vendD.Gstin}                                    PAN: ${vendD.Pan}`, 20, 150)
        .font("Times-Roman")
        .text("Client's Name", 20, 170, { underline: true })
        .font("Times-Bold")
        .text(vendD.Name, 72, 170, { bold: true })
        .font("Times-Roman")
        .text("Subject", 270, 170, { underline: true })
        .font("Times-Bold")
        .text(subject, 300, 170, { bold: true })
        .text('Being the charges towards selling of space in Print Media as per detail given below:', 20)
}

function generateRoTable(doc, status, arr, rupee) {
    generateTableRow(doc, 195, "PUBLICATION (S)", " Ref.", "        DATE", "    SIZE", "SPACE", "   RATE", "  AMOUNT");
    generateTableRow(doc, 205, "EDITIONS", "", " DD/MM/YYYY", "   W x H", " SQ. CM.", "     SQ. CM.", "      INR");
    doc.image(rupee, 510, 195, { scale: 0.03 });

    let idx = 220;
    for(let p of arr) {
        generateTableRow(doc, idx, p[0], p[1], formatDate(p[2]), `${p[3]} x ${p[4]}`, p[3] * p[4], p[5], commaSeparated(p[3] * p[4] * p[5]) + '0.00');
        idx+= 7;
        generateTableRow(doc, idx, p[6], "", "", "", "", "");
        idx+= 15;
    }
}

function generateTableRow(doc, y, publication, ref, date, size, space, rate, amount) {
    doc
        .font("Times-Roman")
        .fillColor('black')
        .lineWidth(12);

    if (y == 195 || y == 205) {
        fillBackground(doc, y+3);
        doc.fillColor('white');
    }

    doc
        .fontSize(7.2)
        .text(publication, 20, y)
        .text(ref, 188, y)
        .text(date, 232, y)
        .text(size, 304, y);

    if (y == 195) {
        doc
            .text(space, 360, y)
            .text(rate, 417, y);
    }
    else {
        doc
            .text(space, 358, y)
            .text(rate, 409, y);
    }

    doc
        .text(amount, 473, y);
}

function fillInv(doc, y) {
    doc
        .lineWidth(22)
        .lineCap('butt')
        .moveTo(462, y)
        .lineTo(580, y)
        .stroke();
}

function fillBackground(doc, y) {
    let mt = [18, 182, 225, 289, 345, 396, 462];
    let lt = [181, 224, 288, 344, 395, 461, 530];

    for (let i in mt) {
        doc
            .lineWidth(9)
            .lineCap('butt')
            .moveTo(mt[i], y)
            .lineTo(lt[i], y)
            .stroke();
    }
}

function commaSeparated(num) {
    return num.toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

function formatDate(date) {
    var arr = date.split('-')
    return arr[2] + "-" + arr[1] + "-" + arr[0];
}

module.exports = { createBill };