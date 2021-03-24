var path = require("path");
const PaperGroups = require(path.relative('helper', 'models/Master/PaperGroups.js'));
const Vend = require(path.relative('helper', 'models/Master/Vendor.js'));
const Subject = require(path.relative('helper', 'models/Master/Subject.js'));
const Newspaper = require(path.relative('helper', 'models/Master/Newspaper.js'));
const Edition = require(path.relative('helper', 'models/Master/Edition.js'));

async function groupDetails() {
    const data = await PaperGroups.findAll({order: ['GroupName']});
    let obj = [];
    for (let ele of data) obj.push(ele.dataValues);
    return obj;
}

async function vendDetails() {
    const data = await Vend.findAll({attributes: ['Name'], order: ['Name']});
    let obj = [];
    for (let ele of data) obj.push(ele.dataValues);
    return obj;
}

async function subjectDetails() {
    const data = await Subject.findAll({order: ['SubjectDetail']});
    let obj = [];
    for (let ele of data) obj.push(ele.dataValues);
    return obj;
}

async function newspaperNames(grpCode) {
    const data = await Newspaper.findAll({ attributes: ['ShortName'], where: { GroupCode: grpCode }, order: ['ShortName'] });
    let obj = [];
    for (let ele of data) obj.push(ele.dataValues);
    return obj;
}

async function editionList() {
    const data = await Edition.findAll({ order: ['CityName'] });
    let obj = [];
    for (let ele of data) obj.push(ele.dataValues);
    return obj;
}

module.exports = { groupDetails, vendDetails, subjectDetails, newspaperNames, editionList };