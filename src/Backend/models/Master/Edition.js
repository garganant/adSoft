const Sequelize = require('sequelize');

module.exports = sequelize.define('Edition', {
    //attributes
    Code: {
        type: Sequelize.STRING(5),
        primaryKey: true
    },
    CityName: {
        type: Sequelize.STRING(25)
    }
}, {
    //options
    charset: 'utf8',
    collate: 'utf8_unicode_ci',
    timestamps: false,
    freezeTableName: true
});
