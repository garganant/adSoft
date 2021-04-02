var path = require("path");
const RoSame = require(path.relative('helper/Input', 'models/Input/RoSame.js'));
const Bill = require(path.relative('helper/Input', 'models/Input/Bill.js'));

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
            AdRef: obj.AdRef
        }
    });
}

function getCurDate() {
    let d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}

module.exports = { billAdd };