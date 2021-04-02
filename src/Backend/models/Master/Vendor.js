const Sequelize = require('sequelize');

module.exports = sequelize.define('vend', {
    //attributes
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Name: {
        type: Sequelize.STRING
    },
    Identify: {
        type: Sequelize.STRING(15)
    },
    Street1: {
        type: Sequelize.STRING(40)
    },
    Street2: {
        type: Sequelize.STRING(40)
    },
    City: {
        type: Sequelize.STRING(40)
    },
    Pincode: {
        type: Sequelize.INTEGER(6)
    },
    State: {
        type: Sequelize.STRING(40)
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
