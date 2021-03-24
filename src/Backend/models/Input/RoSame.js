const Sequelize = require('sequelize');

const RoSame = sequelize.define('RoSame', {
    //attributes
    RoNo: {
        type: Sequelize.INTEGER(10),
        primaryKey: true
    },
    GroupCode: {
        type: Sequelize.STRING(6)
    },
    VendName: {
        type: Sequelize.STRING
    },
    RoDate: {
        type: Sequelize.DATEONLY
    },
    SubjectCode: {
        type: Sequelize.INTEGER(2)
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
        type: Sequelize.STRING(100)
    }
}, {
    //options
    charset: 'utf8',
    collate: 'utf8_unicode_ci',
    timestamps: false,
    freezeTableName: true
});

module.exports = RoSame;