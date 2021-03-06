const Sequelize = require('sequelize');
require('dotenv').config();

// Option 1: Passing parameters separately
var sequelize = new Sequelize(process.env.DATABASE, process.env.USER, process.env.PASSWORD, {
        define: {
            charset: 'utf8',
            collate: 'utf8_general_ci'
        },
        host: 'localhost',   // localhost 192.168.1.9
        dialect: 'mysql'
    });

sequelize.authenticate()
    .then(async () => {
        console.log('Connection has been established successfully.');
        basic();
    })
    .catch(err => console.error('Unable to connect to the database:', err) );

async function basic() {
    require('../models/Master/Vendor.js');
    require('../models/Master/Comp.js');
    require('../models/Master/Edition.js');
    require('../models/Master/PaperGroups.js');
    require('../models/Master/Newspaper.js');
    require('../models/Master/Subject.js');
    require('../models/Master/Office.js');
    require('../models/Input/RoPaper.js');
    require('../models/Input/RoSame.js');
    require('../models/Input/Bill.js');
    require('../models/Restore_info.js');
    await sequelize.sync();
}

module.exports = sequelize;
global.sequelize = sequelize;
