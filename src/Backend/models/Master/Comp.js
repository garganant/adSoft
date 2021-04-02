const Sequelize = require('sequelize');

module.exports = sequelize.define('Comp', {
    //attributes
    Code: {
        type: Sequelize.STRING(10),
        primaryKey: true
    },
    Name: {
        type: Sequelize.STRING
    },
    Address: {
        type: Sequelize.STRING
    },
    Phone: {
        type: Sequelize.STRING
    },
    Fax: {
        type: Sequelize.STRING
    },
    Mobile: {
        type: Sequelize.STRING
    },
    Email: {
        type: Sequelize.STRING
    },
    Website: {
        type: Sequelize.STRING
    },
    Pan: {
        type: Sequelize.STRING(10)
    },
    Gstin: {
        type: Sequelize.STRING(15)
    },
    Cin: {
        type: Sequelize.STRING(25)
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
    Spl1: {
        type: Sequelize.STRING(100)
    },
    Spl2: {
        type: Sequelize.STRING(100)
    },
    MsmeRegn: {
        type: Sequelize.STRING(20)
    },
    Udyam: {
        type: Sequelize.STRING(20)
    },
    Tan: {
        type: Sequelize.STRING(10)
    },
    HsnCode: {
        type: Sequelize.STRING(6)
    },
    FY: {
        type: Sequelize.STRING(7)
    },
    BCName: {
        type: Sequelize.STRING
    },
    Bank: {
        type: Sequelize.STRING
    },
    AccNo: {
        type: Sequelize.STRING(12)
    },
    Branch: {
        type: Sequelize.STRING
    },
    Ifsc: {
        type: Sequelize.STRING(11)
    },
    File_path: {
        type: Sequelize.STRING
    }
}, {
    //options
    charset: 'utf8',
    collate: 'utf8_unicode_ci',
    timestamps: false,
    freezeTableName: true
});
