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
            Salutation: obj.Salutation,
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
        let arr = [], custTparty = "";
        var sData = await RoSame.findAll({ where: { BillNo: num } });
        if(sData == null) continue;
        var vend = await Vend.findOne({ where: { id: sData[0].dataValues.VendCode } });
        if(sData[0].dataValues.TParty != "") {
            custTparty = vend.dataValues.Name;
            let v = await Vend.findOne({ attributes: ['id'], where: { Name: sData[0].dataValues.TParty } });
            sData[0].dataValues.VendCode = v.dataValues.id;
        }
        vend = await Vend.findOne({ where: { id: sData[0].dataValues.VendCode } });
        var subject = (await Subject.findOne({ attributes: ['SubjectDetail'], where: { Code: sData[0].SubjectCode } })).dataValues.SubjectDetail;
        let bData = await Bill.findOne({ where: {BillNo: num } });
        for(let i in sData) {
            let pData = await RoPaper.findAll({ where: { RoNo: sData[i].dataValues.RoNo } });
            for (let j in pData) {
                let tmp = [];
                tmp.push(paperMap[pData[j].dataValues.ShortName]);
                tmp.push(num);
                tmp.push(pData[j].dataValues.DateP);
                tmp.push(pData[j].dataValues.Width);
                tmp.push(pData[j].dataValues.Height);
                tmp.push(parseFloat(pData[j].dataValues.RateCR));
                tmp.push(cityMap[pData[j].dataValues.EditionCode]);
                tmp.push(pData[j].dataValues.RoNo);
                arr.push(tmp);
            }
        }
        collection.push([vend.dataValues, subject, arr, sData[0].dataValues, bData.dataValues, custTparty]);
    }
    return [cData.dataValues, collection];
}

function getCurDate() {
    let d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}

module.exports = { billAdd, billPrtData };