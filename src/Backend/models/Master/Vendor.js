const Sequelize = require('sequelize');

module.exports = sequelize.define('vend', {
    //attributes
    Name: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    Address: {
        type: Sequelize.STRING
    },
    ContactPerson: {
        type: Sequelize.STRING
    },
    ContactNo: {
        type: Sequelize.STRING
    },
    Gstin: {
        type: Sequelize.STRING(15)
    },
    Pan: {
        type: Sequelize.STRING(10)
    },
    Status: {   // L=Local & C=Central
        type: Sequelize.STRING(1)
    }
}, {
    //options
    charset: 'utf8',
    collate: 'utf8_unicode_ci',
    timestamps: false,
    freezeTableName: true
});
