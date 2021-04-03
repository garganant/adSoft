const Sequelize = require('sequelize');

module.exports = sequelize.define('Subject', {
    //attributes
    Code: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    SubjectDetail: {
        type: Sequelize.STRING(40)
    }
}, {
    //options
    charset: 'utf8',
    collate: 'utf8_unicode_ci',
    timestamps: false,
    freezeTableName: true
});
