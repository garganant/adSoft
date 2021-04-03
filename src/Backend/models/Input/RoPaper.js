const Sequelize = require('sequelize');
// Include path module
var path = require("path");
const RoSame = require(path.relative('RoPaper.js', 'Input/RoSame.js'));

const RoPaper = sequelize.define('RoPaper', {
    //attributes
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    RoNo: {
        type: Sequelize.INTEGER
    },
    ShortName: {
        type: Sequelize.STRING(5)
    },
    EditionCode: {
        type: Sequelize.STRING(5)
    },
    SubE : {
        type: Sequelize.STRING(25)
    },
    Caption: {
        type: Sequelize.STRING(15)
    },
    RatePR: {
        type: Sequelize.DECIMAL(7, 2)
    },
    RateCR: {
        type: Sequelize.DECIMAL(7, 2)
    },
    Width: {
        type: Sequelize.INTEGER
    },
    Height: {
        type: Sequelize.INTEGER
    },
    DateP: {
        type: Sequelize.DATEONLY
    }
}, {
    //options
    charset: 'utf8',
    collate: 'utf8_unicode_ci',
    timestamps: false,
    freezeTableName: true
});

RoSame.hasMany(RoPaper, {
    foreignKey: 'RoNo',
    onDelete: 'CASCADE',
    onUpdate: 'NO ACTION'
});

module.exports = RoPaper;