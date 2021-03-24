const Sequelize = require('sequelize');

module.exports = sequelize.define('PaperGroups', {
    //attributes
    Code: {
        type: Sequelize.STRING(6),
        primaryKey: true
    },
    GroupName: {
        type: Sequelize.STRING(30)
    },
    HoLoc: {
        type: Sequelize.STRING(25)
    }
}, {
    //options
    charset: 'utf8',
    collate: 'utf8_unicode_ci',
    timestamps: false,
    freezeTableName: true
});
