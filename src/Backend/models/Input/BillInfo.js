const Sequelize = require('sequelize');

module.exports = sequelize.define('BillInfo', {
    //attributes
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    BillNo: {
        type: Sequelize.INTEGER(10)
    },
    BillDate: {
        type: Sequelize.DATEONLY
    },
    RoNo: {
        type: Sequelize.INTEGER(10)
    }
}, {
    //options
    charset: 'utf8',
    collate: 'utf8_unicode_ci',
    freezeTableName: true
});
