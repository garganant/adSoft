const fs = require("fs");
const PDFWindow = require('electron-pdf-window');
const PDFDocument = require("pdfkit");

function createRo(Logo, sameD, diffD, compD, paperMap, cityMap, signStamp) {
    let doc = new PDFDocument({ size: "A4", margin: 20
});

    generateHeader(doc, Logo);
    let y = 0;
    generateCustomerInfo(doc, sameD);
    y = generateRoTable(doc, y, diffD, paperMap, cityMap, sameD, compD.IGst);
    y = generateBottom(doc, y, compD, sameD, signStamp);
    generateFooter(doc, compD, sameD, y);

    doc.end();
    doc.pipe(fs.createWriteStream(`${compD.File_path}RO_No-${sameD.RoNo}.pdf`));
    let child = new PDFWindow({ title: 'File', autoHideMenuBar: true });
    child.loadURL(`${compD.File_path}RO_No-${sameD.RoNo}.pdf`);
}

function generateHeader(doc, Logo) {
    doc
        .image(Logo, 498, 0, { fit: [100, 92] })
        .moveDown();
}

function generateCustomerInfo(doc, sameD) {
    doc
        .fontSize(8)
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
        .text(sameD.SubjectDetail, 65)
        .font("Helvetica")
        .moveDown(0.3)
        .text('Hue:', 20)
        .moveUp()
        .font("Helvetica-Bold")
        .text(sameD.Hue == 'B' ? 'B / W' : 'Coloured', 65);

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
    y = 160, check = 0;
    generateTableRow(doc, y, x, "CAPTION", "PUBLICATION", "EDITIONS / SUB-EDITION / PACKAGE", "RATES", " SIZE", "", "DATES", "DAY", sameD.AdType, check);
    x = [20, 128, 231, 405, 433, 472, 538];
    y = 170;
    generateTableRow(doc, y, x, "", "", "", "SQCM", "W", "H", " DD/MM/YYYY", "", sameD.AdType, check);
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let gross = 0;
    y = 185;
    for(let obj of diffD) {
        x = [20, 128, 231, 425 - doc.widthOfString(obj.RatePR), 430, 480, 535];
        let day = days[new Date(obj.DateP).getDay()];
        let edi_sub_pkg = cityMap[obj.EditionCode];
        if (obj.SubE != '') edi_sub_pkg+= ' / ' + obj.SubE;
        if(sameD.Package != '') edi_sub_pkg+= ' / ' + sameD.Package;
        generateTableRow(doc, y, x, obj.Caption, paperMap[obj.ShortName], edi_sub_pkg, obj.RatePR, parseFloat(obj.Width), parseFloat(obj.Height), formatDate(obj.DateP), day, sameD.AdType, check);
        y+= 15;
        generateHr(doc, y - 4);
        if(sameD.AdType == 'D') gross+= obj.RatePR * obj.Width * obj.Height;
        else gross+= parseFloat(obj.RatePR);
    }
    y = Math.max(y+12, 384);
    generateHr(doc, y - 2);
    generateTableRow(doc, y, x, "Discount | Rates confirmed by:", sameD.RConfirm, "", "", "", "", "", "", sameD.AdType, check);
    y+= 10;

    x = [20, 150, 280, 384, 433, 488, 526];
    doc
        .lineWidth(12)
        .strokeColor('#D0D0D0');
    fillBackground(doc, y);
    generateHr(doc, y - 2);
    generateTableRow(doc, y, x, `Special Discount : ${sameD.SplDis} %`, "GROSS VALUE", "ADDL DISCOUNT", "T. DISCOUNT", "NET AMT", "", "GST", "NET PAYABLE", sameD.AdType, check);

    y+= 10;
    check = y;
    generateHr(doc, y - 2);
    let addl = gross * sameD.SplDis * 0.01;
    let trade = (gross - addl) * sameD.TradeDis * 0.01;
    let net = gross - addl - trade;
    let gst = net * IGst * 0.01;
    x = [20, 128, 231, 385, 428, 471, 522];
    generateTableRow(doc, y, x, `Trade Discount / AC  : ${sameD.TradeDis} %`, commaSeparated(gross), commaSeparated(addl), commaSeparated(trade), commaSeparated(net), "", commaSeparated(gst), commaSeparated(net + gst), sameD.AdType, check);
    y+= 10;
    generateHr(doc, y - 2);
    generateVr(doc, y);

    doc.font("Helvetica-Bold");
    y+= 10;
    generateTableRow(doc, y, x, `POSITION: ${sameD.Position}`, "", "Material : Attached in email", "", "", "", "", "", sameD.AdType, check);

    return y;
}

function generateTableRow(doc, y, x, caption, paper, edition, rate, w, h, date, day, AdType, check) {
    doc
        .font("Helvetica-Bold")
        .fillColor('black')
        .lineWidth(12);

    if(y == 160) {
        fillBackground(doc, y);
        doc.fillColor('white');
    }
    else if(y == 170) {
        doc.strokeColor('#D0D0D0');
        fillBackground(doc, y);
    }

    doc
        .fontSize(7.2)
        .text(caption, x[0], y);

    if(y != check) {
        doc  
            .text(paper, x[1], y)
            .text(edition, x[2], y)
            .text(rate, x[3], y)
            .text(date, x[5], y)
            .text(day, x[6], y);
    }
    else {
        doc
            .text(paper, x[1], y, { width: 100, align: 'center' })
            .text(edition, x[2], y, { width: 150, align: 'center' })
            .text(rate, x[3], y, { width: 44, align: 'center' })
            .text(date, x[5], y, { width: 48, align: 'center' })
            .text(day, x[6], y, { width: 57, align: 'center' });
    }


    if (y == 160) doc.text(w, x[4], y);
    else if(y == 170) {
        if (AdType == 'D') {
            doc
                .text(w, x[4], y)
                .text('x', 446, y)
                .text(h, 457, y);
        }
    }
    else {
        if(y != check) doc.text(w, x[4], y);
        else doc.text(w, x[4], y, { width: 40, align: 'center' });
        if(AdType == 'D') {
            if (typeof w == 'number') doc.text('x', 446, y);
            doc.text(h, 451, y);
        }
        else if (typeof w == 'number') doc.text('LINES/W', 440, y);
    }
}

function generateBottom(doc, y, compD, sameD, signStamp) {
    let s1 = "Terms and Conditions : ";
    let s2 = `us to process the bill(s) for  payment as per INS rules.  The advertisement should be appeared according to the actual size of the advertisement / material supplied.  Follow our layout in case of translation of the matter for publiction the ad in newspaper's language if instructed.  Do not publish two advertisements of one client / product on same page / issue unless specially instructed.  All disputes are subject to the jurisdiction of Delhi Courts only. RO will be valid only if sent through "${compD.Email}".`;

    doc
        .fontSize(8)
        .moveDown(2)
        .text('Special Instructions :   1.', 20)
        .moveUp()
        .fillColor('red')
        .text(sameD.Spl1 != null ? sameD.Spl1 : '', 115)
        .fillColor('black')
        .text('2.', 108)
        .moveUp()
        .fillColor('red')
        .text(sameD.Spl2 != null ? sameD.Spl2 : '', 115)
        .font("Helvetica")
        .fillColor('black');
    
    y+= 60;
    doc.text('Payment will be made as per INS rules (within 60 days from the last date of the month in which the ads has / have published)', 20, y);

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
        .text('RO SENT', 370)
        .moveUp()
        .text('CONFIRMED', 470)
        .moveDown()
        .text('Approved by', 300)
        .moveUp()
        .text('MATERIAL SENT', 370)
        .moveUp()
        .text('CONFIRMED', 470);

    y += 42;
    generateHr(doc, y);

    if(sameD.Matter != "") {
        doc
            .text('', 20)
            .fillColor('black')
            .moveDown(5)
            .text(sameD.Matter, { align: 'justify' });
    }
    else doc.moveDown(7);

    y+= 25;
    lines(doc, y);
    return y;
}

function generateFooter(doc, compD, sameD, y) {
    doc
        .moveDown()
        .text('', 20)
        .fillColor('#1434A4')
        .fontSize(12)
        .font("Helvetica-Bold")
        .text(compD.Name, { align: 'center' });

    doc
        .fillColor('black')
        .fontSize(6.5)
        .font("Helvetica")
        .text(compD.Address, { align: 'center' })
        .moveDown(0.3)
        .text(`Tel. ${compD.Phone} Fax: ${compD.Fax} Cell: ${compD.Mobile}`, { align: 'center' })
        .moveDown(0.2)
        .text(`Email: ${compD.Email} Website: ${compD.Website}`, { align: 'center' })
        .moveDown(0.2)
        .font("Helvetica-Bold")
        .text(`INS / AGENCY CODE: ${compD.Code} | GST: ${compD.Gstin} | PAN: ${compD.Pan} | CIN: ${compD.Cin}`, { align: 'center', underline: true });

    y+= 124;

    doc
        .lineWidth(12)
        .lineCap('butt')
        .moveTo(20, y)
        .lineTo(580, y)
        .stroke();

    if (sameD['Office'] != 0) {
        doc
            .moveDown(0.7)
            .fillColor('white')
            .text(sameD['OfficeAdd'], { align: 'center' });
    }
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

function generateHr(doc, y) {
    doc
        .strokeColor('black')
        .lineWidth(0.1)
        .moveTo(18, y)
        .lineTo(576, y)
        .stroke();
}

function generateVr(doc, y) {
    let x = [18, 126, 229, 383, 429, 470, 526, 577];
    for (let i in x) {
            doc
                .strokeColor('black')
                .lineWidth(0.1)
                .moveTo(x[i], 158)
                .lineTo(x[i], y-1)
                .stroke();
    }
}

function lines(doc, y) {
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