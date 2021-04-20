const Sequelize = require('sequelize');

module.exports = sequelize.define('restore_info', {
    //attributes
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Path: {
        type: Sequelize.STRING
    }
}, {
    //options
    charset: 'utf8',
    collate: 'utf8_unicode_ci',
    freezeTableName: true
});
