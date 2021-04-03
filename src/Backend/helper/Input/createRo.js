const fs = require("fs");
const PDFWindow = require('electron-pdf-window');
const PDFDocument = require("pdfkit");

function createRo(sameD, diffD, compD, paperMap, cityMap, signStamp) {
    let doc = new PDFDocument({ size: "A4", margin: 20 });

    generateHeader(doc, compD);
    let s = "", y = 0;
    for(let ele of diffD) s+= ele['ShortName'] + ' + ';
    generateCustomerInfo(doc, s.substring(0, s.length-2), sameD);
    y = generateRoTable(doc, y, diffD, paperMap, cityMap, sameD, compD.IGst);
    generateFooter(doc, y, compD, sameD, signStamp);

    doc.end();
    doc.pipe(fs.createWriteStream(`${compD.File_path}RO${sameD.RoNo}.pdf`));
    let child = new PDFWindow({ title: 'File', autoHideMenuBar: true });
    child.loadURL(`${compD.File_path}RO${sameD.RoNo}.pdf`);
}

function generateHeader(doc, compD) {
    doc
        .fillColor('#1434A4')
        .fontSize(12)
        .font("Helvetica-Bold")
        .text(compD.Name, { align: 'right' });

    doc
        .fillColor('black')
        .fontSize(6.5)
        .font("Helvetica")
        .text(compD.Address, { align: 'right' })
        .text(`Tel. ${compD.Phone} Fax: ${compD.Fax} Cell: ${compD.Mobile}`, { align: 'right' })
        .text(`Email: ${compD.Email} Website: ${compD.Website}`, { align: 'right' })
        .font("Helvetica-Bold")
        .text(`INS / AGENCY CODE: ${compD.Code} | GST: ${compD.Gstin} | PAN: ${compD.Pan} | CIN: ${compD.Cin}`, { align: 'right', underline: true });

    doc.moveDown();
}

function generateCustomerInfo(doc, pub, sameD) {
    doc
        .fontSize(8)
        .font("Helvetica-Bold")
        .text('Kind Attention:', { underline: true })
        .moveDown()
        .font("Helvetica")
        .text('The Advertisement Manager')
        .fontSize(9)
        .font("Helvetica-Bold")
        .text(`${sameD.GroupName}`)
        .font("Helvetica")
        .text(`${sameD.HoLoc}`)
        .moveDown()
        .text('Dear Sir,')
        .moveDown(0.4)
        .fontSize(7)
        .text('Kindly arrange to publish the advertisement(s) as per terms and conditions and instructions below:')
        .moveDown(0.3)
        .fontSize(8)
        .text('Publication:')
        .moveUp()
        .font("Helvetica-Bold")
        .text(pub, 65)
        .moveDown(0.3)
        .font("Helvetica")
        .text('Client:', 20)
        .moveUp()
        .font("Helvetica-Bold")
        .text(sameD.VendName, 65)
        .font("Helvetica")
        .moveDown(0.3)
        .text('Subject:', 20)
        .moveUp()
        .font("Helvetica-Bold")
        .text(sameD.SubjectDetail, 65);

        doc
            .moveUp(4.5)
            .fontSize(12)
            .font("Helvetica-Bold")
            .text('RELEASE ORDER', { underline: true, align: 'right' })
            .moveDown(0.1)
            .fontSize(8)
            .font("Helvetica")
            .text('RO No.', 472)
            .moveUp()
            .font("Helvetica-Bold")
            .text(sameD.RoNo, 502)
            .moveDown(0.1)
            .font("Helvetica")
            .text('Date:', 472)
            .moveUp()
            .font("Helvetica-Bold")
            .text(formatDate(sameD.RoDate), 502);
}

function generateRoTable(doc, y, diffD, paperMap, cityMap, sameD, IGst) {
    let x = [20, 128, 231, 405, 438, 485, 538];
    y = 210;
    generateTableRow(doc, y, x, "CAPTION", "PUBLICATION", "EDITIONS / SUB-EDITION / PACKAGE", "RATES", " SIZE", "", "DATES", "DAY", sameD.AdType);
    x = [20, 128, 231, 405, 431, 472, 538];
    y = 220;
    generateTableRow(doc, y, x, "", "", "", "SQCM", "W", "H", " DD/MM/YYYY", "", sameD.AdType);
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let gross = 0;
    y = 232;
    for(let obj of diffD) {
        x = [20, 128, 231, 425 - doc.widthOfString(obj.RatePR), 431, 480, 535];
        let day = days[new Date(obj.DateP).getDay()];
        let edi_sub_pkg = cityMap[obj.EditionCode];
        if (obj.SubE != '') edi_sub_pkg+= ' / ' + obj.SubE;
        if(sameD.Package != '') edi_sub_pkg+= ' / ' + sameD.Package;
        generateTableRow(doc, y, x, obj.Caption, paperMap[obj.ShortName], edi_sub_pkg, obj.RatePR, parseInt(obj.Width), obj.Height, formatDate(obj.DateP), day, sameD.AdType);
        y+= 12;
        generateHr(doc, y - 3, "#aaaaaa");
        if(sameD.AdType == 'D') gross+= obj.RatePR * obj.Width * obj.Height;
        else gross+= parseFloat(obj.RatePR);
    }
    y = Math.max(y+12, 380);
    generateTableRow(doc, y, x, "Discount | Rates confirmed by:", sameD.RConfirm, "", "", "", "", "", "", sameD.AdType);
    y+= 10;

    generateHr(doc, y - 2, "black");
    x = [20, 173, 320, 383, 435, 509, 526];
    doc
        .lineWidth(12)
        .strokeColor('#D0D0D0');
    fillBackground(doc, y);
    generateTableRow(doc, y, x, `Special Discount : ${sameD.SplDis} %`, "GROSS VALUE", "ADDL DISCOUNT", "T. DISCOUNT", "NET AMT", "", "GST", "NET PAYABLE", sameD.AdType);

    y+= 10;
    generateHr(doc, y - 2, "black");
    let addl = gross * sameD.SplDis * 0.01;
    let trade = (gross - addl) * sameD.TradeDis * 0.01;
    let net = gross - addl - trade;
    let gst = net * IGst * 0.01;
    x = [20,
        224 - doc.widthOfString(commaSeparated(gross) + '.00'),
        380 - doc.widthOfString(commaSeparated(addl) + '.00'),
        424 - doc.widthOfString(commaSeparated(trade) + '.00'),
        469 - doc.widthOfString(commaSeparated(net) + '.00'),
        522 - doc.widthOfString(commaSeparated(gst) + '.00'),
        572 - doc.widthOfString(commaSeparated(net + gst) + '.00')];
    generateTableRow(doc, y, x, `Trade Discount / AC  : ${sameD.TradeDis} %`, commaSeparated(gross) + '.00', commaSeparated(addl) + '.00', commaSeparated(trade) + '.00', commaSeparated(net) + '.00', "", commaSeparated(gst) + '.00', commaSeparated(net + gst) + '.00', sameD.AdType);
    y+= 10;
    generateHr(doc, y - 2, "black");
    generateVr(doc, y);

    doc.font("Helvetica-Bold");
    y+= 10;
    generateTableRow(doc, y, x, `POSITION: ${sameD.Position}`, "", "Material : Attached in email", "", "", "", "", "", sameD.AdType);

    return y;
}

function generateTableRow(doc, y, x, caption, paper, edition, rate, w, h, date, day, AdType) {
    doc
        .font("Helvetica-Bold")
        .fillColor('black')
        .lineWidth(12);

    if(y == 210) {
        fillBackground(doc, y);
        doc.fillColor('white');
    }
    else if(y == 220) {
        doc.strokeColor('#D0D0D0');
        fillBackground(doc, y);
    }

    doc
        .fontSize(7.2)
        .text(caption, x[0], y);

    doc  
        .text(paper, x[1], y)
        .text(edition, x[2], y)
        .text(rate, x[3], y)
        .text(date, x[5], y)
        .text(day, x[6], y);

    if (y == 210) doc.text(w, x[4], y);
    else if(y == 220) {
        if (AdType == 'D') {
            doc
                .text(w, x[4], y)
                .text('x', 444, y)
                .text(h, 455, y);
        }
    }
    else {
        doc.text(w, x[4], y);
        if(AdType == 'D') {
            if (typeof w == 'number') doc.text('x', 444, y);
            doc
                .text(h, 455, y);
        }
        else if (typeof w == 'number') doc.text('LINES', 445, y);
    }
}

function generateFooter(doc, y, compD, sameD, signStamp) {
    let s1 = "Terms and Conditions : ";
    let s2 = `us to process the bill(s) for  payment as per INS rules.  The advertisement should be appeared according to the actual size of the advertisement / material supplied.  Follow our layout in case of translation of the matter for publiction the ad in newspaper's language if instructed.  Do not publish two advertisements of one client / product on same page / issue unless specially instructed.  All disputes are subject to the jursdiction of Delhi Courts only. RO will be valid only if sent through "${compD.Email}".`;

    doc
        .fontSize(8)
        .moveDown(2)
        .text('Special Instructions :   1.', 20)
        .moveUp()
        .fillColor('red')
        .text(sameD.Spl1 != null ? sameD.Spl1 : '', 115)
        .fillColor('black')
        .text('Special Instructions :   2.', 20)
        .moveUp()
        .fillColor('red')
        .text(sameD.Spl2 != null ? sameD.Spl2 : '', 115)
        .font("Helvetica")
        .fillColor('black')
        .moveDown(0.2)
        .text('Payment will be made as per INS rules (within 60 days from the last date of the month in which the ads has / have published)', 20);
    
    y+= 82;
        generateHr(doc, y, 'black');

    doc
        .moveDown(0.5)
        .font("Helvetica-Bold")
        .fontSize(6)
        .text(s1)
        .moveUp()
        .font("Helvetica")
        .text("No alternation in Release Order will be accepted. Send your bill in duplicate along with copy of this Release Order immediately on publication of the advertisement to enable ", doc.widthOfString(s1) + 26)
        .text(s2, 20)
        .moveDown()
        .fontSize(8)
        .text(`for ${compD.Name}`)
        .image(signStamp, { scale: 0.10 })
        .text('Media Executive')
        .fontSize(6)
        .moveUp(7)
        .fillColor('grey')
        .text('RO SENT', 370)
        .moveUp()
        .text('CONFIRMED', 470)
        .moveDown()
        .text('Approved by', 300)
        .moveUp()
        .text('MATERIAL SENT', 370)
        .moveUp()
        .text('CONFIRMED', 470);

    lines(doc, y);
}

function fillBackground(doc, y) {
    let mt = [18, 127, 230, 384, 430, 471, 527];
    let lt = [126, 229, 383, 429, 470, 526, 577];

    for(let i in mt) {
        doc
            .lineCap('butt')
            .moveTo(mt[i], y + 3)
            .lineTo(lt[i], y + 3)
            .stroke();
    }
}

function generateHr(doc, y, color) {
    doc
        .strokeColor(color)
        .lineWidth(0.1)
        .moveTo(16, y)
        .lineTo(576, y)
        .stroke();
}

function generateVr(doc, y) {
    let x = [126, 229, 383, 429, 470, 526, 577];
    for (let i in x) {
            doc
                .strokeColor("#aaaaaa")
                .lineWidth(0.1)
                .moveTo(x[i], 208)
                .lineTo(x[i], y-1)
                .stroke();
    }
}

function lines(doc, y) {
    y+= 25;
    let x1 = [290, 450];
    let x2 = [440, 580];
    for(let i in x1) {
        doc
            .strokeColor('black')
            .lineWidth(0.1)
            .moveTo(x1[i], y)
            .lineTo(x2[i], y)
            .stroke();
        doc
            .strokeColor('black')
            .lineWidth(0.1)
            .moveTo(x1[i], y+16)
            .lineTo(x2[i], y+16)
            .stroke();
    }
    x1 = [365, 420, 440, 450, 468];
    for(let i in x1) {
        doc
            .strokeColor('black')
            .lineWidth(0.1)
            .moveTo(x1[i], y-17)
            .lineTo(x1[i], y + 16.5)
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

module.exports = { createRo };