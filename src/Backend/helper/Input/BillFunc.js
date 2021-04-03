var path = require("path");
const RoSame = require(path.relative('helper/Input', 'models/Input/RoSame.js'));
const RoPaper = require(path.relative('helper/Input', 'models/Input/RoPaper.js'));
const Bill = require(path.relative('helper/Input', 'models/Input/Bill.js'));
const Comp = require(path.relative('helper/Input', 'models/Master/Comp.js'));
const Vend = require(path.relative('helper/Input', 'models/Master/Vendor.js'));
const PaperGroups = require(path.relative('helper/Input', 'models/Master/PaperGroups.js'));
const Subject = require(path.relative('helper/Input', 'models/Master/Subject.js'));
const Newspaper = require(path.relative('helper/Input', 'models/Master/Newspaper.js'));
const Edition = require(path.relative('helper/Input', 'models/Master/Edition.js'));

async function billAdd(obj, roNo, billNo) {
    for(let r of roNo) await RoSame.update({ BillNo: billNo, BillDate: getCurDate(), Advance: obj.Advance }, { where: { RoNo: r } });
    await Bill.findOrCreate({
        where: { BillNo: billNo },
        defaults: {
            Prospect: obj.Prospect,
            Attention: obj.Attention,
            Product: obj.Product,
            Month: obj.Month,
            Activity: obj.Activity,
            AdRef: obj.AdRef,
            LSplDis: obj.LSplDis
        }
    });
}

async function billPrtData(s, e) {
    var grpMap = {}, paperMap = {}, cityMap = {}, collection = [];
    var cData = await Comp.findOne();
    var publications = await PaperGroups.findAll();
    var papers = await Newspaper.findAll({ attributes: ['ShortName', 'PaperName'] });
    var cities = await Edition.findAll();
    for (let ele of publications) grpMap[ele.dataValues['Code']] = ele.dataValues['GroupName'];
    for (let ele of papers) paperMap[ele.dataValues['ShortName']] = ele.dataValues['PaperName'];
    for (let ele of cities) cityMap[ele.dataValues['Code']] = ele.dataValues['CityName'];

    for (let num = s; num <= e; num++) {
        let arr = [];
        var sData = await RoSame.findOne({ where: { BillNo: num } });
        var vend = await Vend.findOne({ where: { id: sData.dataValues.VendCode } });
        var subject = (await Subject.findOne({ attributes: ['SubjectDetail'], where: { Code: sData.SubjectCode } })).dataValues.SubjectDetail;
        let pData = await RoPaper.findAll({ where: { RoNo: sData.dataValues.RoNo } });
        let bData = await Bill.findOne({ where: {BillNo: num } });
        for (let i in pData) {
            let tmp = [];
            tmp.push(paperMap[pData[i].dataValues.ShortName]);
            tmp.push(num);
            tmp.push(pData[i].dataValues.DateP);
            tmp.push(pData[i].dataValues.Width);
            tmp.push(pData[i].dataValues.Height);
            tmp.push(parseFloat(pData[i].dataValues.RatePR));
            tmp.push(pData[i].dataValues.EditionCode);
            arr.push(tmp);
        }
        collection.push([vend.dataValues, subject, arr, sData.dataValues, bData.dataValues]);
    }
    return [cData.dataValues, collection];
}

function getCurDate() {
    let d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}

module.exports = { billAdd, billPrtData };