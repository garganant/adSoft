const fs = require("fs");
const PDFWindow = require('electron-pdf-window');
const PDFDocument = require("pdfkit");

function createRo(sameD, diffD, compD, paperMap, cityMap, signStamp) {
    let doc = new PDFDocument({ size: "A4", margin: 20 });

    generateHeader(doc, compD);
    let s = "";
    for(let ele of diffD) s+= ele['ShortName'] + ' + ';
    generateCustomerInfo(doc, s.substring(0, s.length-2), sameD);
    generateRoTable(doc, diffD, paperMap, cityMap, sameD, compD.IGst);
    generateFooter(doc, compD.Name, sameD, signStamp);

    doc.end();
    doc.pipe(fs.createWriteStream(compD.File_path + 'File.pdf'));
    let child = new PDFWindow({ title: 'File', autoHideMenuBar: true });
    child.loadURL(compD.File_path + 'File.pdf');
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
        .text(`INS / AGENCY CODE: ${compD.Code} | GST: ${compD.Gstin} | PAN: ${compD.Pan} | CIN: ${compD.Cin}`, { align: 'right' });

    doc.moveDown();
}

function generateCustomerInfo(doc, pub, sameD) {
    doc
        .fontSize(8)
        .font("Times-Bold")
        .text('Kind Attention:', { underline: true })
        .moveDown()
        .font("Times-Roman")
        .text('The Advertisement Manager')
        .fontSize(9)
        .text(`${sameD.GroupName}`)
        .text(`${sameD.HoLoc}`)
        .moveDown(2)
        .text('Dear Sir,')
        .moveDown(0.5)
        .fontSize(7)
        .text('Kindly arrange to publish the advertisement(s) as per terms and conditions and instructions below:')
        .fontSize(8)
        .text(`Publication: ${pub}`)
        .text(`Customer: ${sameD.VendName}`)
        .text(`Subject: ${sameD.SubjectDetail}`);

        doc
            .moveUp(4.5)
            .fontSize(12)
            .font("Helvetica-Bold")
            .text('RELEASE ORDER', { underline: true, align: 'right' })
            .fontSize(8)
            .font("Times-Roman")
            .text(`RO No. ${sameD.RoNo}`, 472, 170)
            .text(`Date: ${formatDate(sameD.RoDate)}`, 472, 180)
            .text(`Ref No. ${sameD.RoNo}`, 472, 190);
}

function generateRoTable(doc, diffD, paperMap, cityMap, sameD, IGst) {
    generateTableRow(doc, 210, "CAPTION", "EDITIONS", "EDITIONS", "RATES", "SIZE", "", "DATES", "DAY");
    generateTableRow(doc, 220, "", "", "", "SQCM", "W", "H", "DD/MM/YYYY", "");
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let y = 232, gross = 0;
    for(let obj of diffD) {
        let day = days[new Date(obj.DateP).getDay()];
        generateTableRow(doc, y, obj.Caption, paperMap[obj.ShortName], cityMap[obj.EditionCode], obj.RatePR, obj.Width, obj.Height, formatDate(obj.DateP), day);
        y+= 10;
        generateHr(doc, y - 2, "#aaaaaa");
        gross+= obj.RatePR * obj.Width * obj.Height;
    }
    generateTableRow(doc, y, "Discount | Rates confirmed by:", "", "", "", "", "", "", "");
    y+= 10;
    generateHr(doc, y - 2, "black");
    generateTableRow(doc, y, `Special Discount : ${sameD.SplDis}`, "GROSS VALUE", "ADDL DISCOUNT", "T. DISCOUNT", "NET AMT", "", "GST", "NET PAYABLE");
    y+= 10;
    generateHr(doc, y - 2, "black");
    let addl = gross * sameD.SplDis * 0.01;
    let trade = (gross - addl) * sameD.TradeDis * 0.01;
    let net = gross - addl - trade;
    let gst = net * IGst * 0.01;
    generateTableRow(doc, y, "Trade Discount / AC  : 15 %", commaSeparated(gross), commaSeparated(addl), commaSeparated(trade), commaSeparated(net), "", commaSeparated(gst), commaSeparated(net + gst));
    y+= 10;
    generateHr(doc, y - 2, "black");
    generateVr(doc, y-1);

    doc.font("Times-Bold");
    generateTableRow(doc, y, `POSITION: ${sameD.Position}`, "", "Material : Attached in email", "", "", "", "", "");
}

function generateTableRow(doc, y, caption, paper, edition, rate, w, h, date, day) {
    doc
        .font("Times-Roman")
        .fillColor('black')
        .lineWidth(12);

    if(y == 210) {
        fillBackground(doc, y);
        doc.fillColor('white');
    }
    else if(y == 220) {
        doc
            .font("Times-Bold")
            .strokeColor('pink');
        fillBackground(doc, y);
    }

    doc
        .fontSize(7.2)
        .text(caption, 20, y)
        .text(paper, 153, y)
        .text(edition, 286, y)
        .text(rate, 385, y);
    
    if(y == 210 || h === "") {
        doc
        .text(w, 438, y)
        .text(date, 480, y);
    }
    else {
        doc
            .text(w, 431, y)
            .text('x', 444, y)
            .text(h, 455, y)
            .text(date, 472, y);
        }
        
        doc
        .text(day, 528, y);
}

function generateFooter(doc, cName, sameD, signStamp) {
    doc
        .fontSize(8)
        .moveDown()
        .text(`Special Instructions :   1. ${sameD.Spl1 != null ? sameD.Spl1 : ''}`, 20)
        .text(`Special Instructions :   2. ${sameD.Spl2 != null ? sameD.Spl2 : ''}`)
        .font("Times-Roman")
        .text('Payment will be made as per INS rules (within 60 days from the last date of the month in which the ads has / have published)')

        generateHr(doc, 319, 'black');

    doc
        .moveDown()
        .font("Times-Bold")
        .text("Terms and Conditions : ")
        .moveUp()
        .font("Times-Roman")
        .text("No alternation in ReleaseOrder will be accepted. Send your bill in duplicate along with copy of this Release Order immediately on publication of ", 102)
        .text("the advertisement to enable us to process the bill(s) for  payment as per INS rules.  The advertisement should be appeared according to the actual size of the advertisement / material supplied.  Follow our layout in case of translation of the matter for publiction the ad in newspaper's language if instructed.  Do not publish two advertisements of one client / product on same page / issue unless specially instructed.  All disputes are subject to the jursdiction of Delhi Courts only.", 20)
        .moveDown()
        .text(`for ${cName}`)
        .image(signStamp, { scale: 0.10 })
        .text('Media Executive')
}

function fillBackground(doc, y) {
    let mt = [18, 152, 285, 384, 430, 471, 527];
    let lt = [151, 284, 383, 429, 470, 526, 577];

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
    let x = [151, 284, 383, 429, 470, 526, 577];
    for (let i in x) {
            doc
                .strokeColor("#aaaaaa")
                .lineWidth(0.1)
                .moveTo(x[i], 208)
                .lineTo(x[i], y)
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