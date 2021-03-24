const Sequelize = require('sequelize');

module.exports = sequelize.define('Newspaper', {
    //attributes
    ShortName: {
        type: Sequelize.STRING(5),
        primaryKey: true
    },
    PaperName: {
        type: Sequelize.STRING(25)
    },
    GroupCode: {
        type: Sequelize.STRING(6)
    }
}, {
    //options
    charset: 'utf8',
    collate: 'utf8_unicode_ci',
    timestamps: false,
    freezeTableName: true
});
