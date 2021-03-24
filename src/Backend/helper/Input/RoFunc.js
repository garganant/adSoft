var path = require("path");
const RoSame = require(path.relative('helper/Input', 'models/Input/RoSame.js'));
const RoPaper = require(path.relative('helper/Input', 'models/Input/RoPaper.js'));
const { newspaperNames } = require(path.relative('Input', 'Functions.js'));

async function roData(roNo) {
    var res = [{}, []];
    var sameData = await RoSame.findOne({where: {RoNo: roNo}});
    var diffData = await RoPaper.findAll({ where: { RoNo: roNo } });
    if(sameData != null) {
        res[0] = sameData.dataValues;
        for (let val of diffData) res[1].push(val.dataValues);
        res[0]['paperNames'] = await newspaperNames(sameData.dataValues.GroupCode);
    }
    return res;
}

async function addEditRO(same, diff) {
    let arr = [];
    const [user, created] = await RoSame.findOrCreate({
        where: { RoNo: same.RoNo },
        defaults: {
            GroupCode: same.GroupCode,
            VendName: same.VendName,
            RoDate: getCurDate(),
            SubjectCode: same.SubjectCode,
            TradeDis: same.TradeDis,
            SplDis: same.SplDis,
            Position: same.Position,
            Spl1: same.Spl1,
            Spl2: same.Spl2
        }
    });
    if (!created) await RoSame.update(same, { where: { RoNo: same.RoNo } });

    await RoPaper.destroy({ where: { RoNo: same.RoNo}});

    await RoPaper.bulkCreate(diff, {
        updateOnDuplicate: ["ShortName", "EditionCode", "Caption", "RatePR", "RateCR", "Width", "Height", "DateP", "Position", "Spl1", "Spl2"]
    });

    if (created) return 'New RO entry added!'
    else return 'RO updated!'
}

function getCurDate() {
    let d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}

module.exports = { roData, addEditRO };