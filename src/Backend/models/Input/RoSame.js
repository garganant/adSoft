const Sequelize = require('sequelize');

const RoSame = sequelize.define('RoSame', {
    //attributes
    RoNo: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    GroupCode: {
        type: Sequelize.STRING(6)
    },
    VendCode: {
        type: Sequelize.INTEGER
    },
    RoDate: {
        type: Sequelize.DATEONLY
    },
    SubjectCode: {
        type: Sequelize.INTEGER
    },
    CGst: {
        type: Sequelize.DECIMAL(5, 2)
    },
    SGst: {
        type: Sequelize.DECIMAL(5, 2)
    },
    IGst: {
        type: Sequelize.DECIMAL(5, 2)
    },
    TradeDis: {
        type: Sequelize.DECIMAL(5, 2)
    },
    SplDis: {
        type: Sequelize.DECIMAL(5, 2)
    },
    Position: {
        type: Sequelize.STRING(30)
    },
    Spl1: {
        type: Sequelize.STRING(100)
    },
    Spl2: {
        type: Sequelize.STRING(200)
    },
    BillNo: {
        type: Sequelize.INTEGER
    },
    BillDate: {
        type: Sequelize.DATEONLY
    },
    Advance: {
        type: Sequelize.DECIMAL(9,2)
    },
    TParty: {
        type: Sequelize.STRING
    },
    Package : {
        type: Sequelize.STRING(25)
    },
    AdType: {   // D = Display, C = Classified
        type: Sequelize.STRING(1)
    },
    RConfirm: {
        type: Sequelize.STRING
    },
    Matter: {
        type: Sequelize.STRING
    },
    Hue: {   // B = B/W, C = Coloured
        type: Sequelize.STRING(1)
    },
    Office: {
        type: Sequelize.INTEGER
    }
}, {
    //options
    charset: 'utf8',
    collate: 'utf8_unicode_ci',
    timestamps: false,
    freezeTableName: true
});

module.exports = RoSame;