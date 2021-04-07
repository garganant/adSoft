const Sequelize = require('sequelize');

module.exports = sequelize.define('Office', {
    //attributes
    Code: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Address: {
        type: Sequelize.STRING
    }
}, {
    //options
    charset: 'utf8',
    collate: 'utf8_unicode_ci',
    timestamps: false,
    freezeTableName: true
});
