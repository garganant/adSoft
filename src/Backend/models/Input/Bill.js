const Sequelize = require('sequelize');

module.exports = sequelize.define('Bill', {
    //attributes
    BillNo: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    Salutation: {
        type: Sequelize.STRING(15)
    },
    Prospect: {
        type: Sequelize.STRING
    },
    Attention: {
        type: Sequelize.STRING(50)
    },
    Product: {
        type: Sequelize.STRING(10)
    },
    Month: {
        type: Sequelize.STRING(15)
    },
    Activity: {
        type: Sequelize.STRING(20)
    },
    AdRef: {
        type: Sequelize.STRING(100)
    },
    LSplDis: {
        type: Sequelize.DECIMAL(9, 2)
    }
}, {
    //options
    charset: 'utf8',
    collate: 'utf8_unicode_ci',
    timestamps: false,
    freezeTableName: true
});