/*
#title           : database.js
#description     : Mongo db config
#author		       : Nikul Prajapati
#email           : nikulprajapati90@gmail.com
#date            : 20150717
#version         : 1.0
*/

var app_config = require('./app_config.js');

// config/database.js
module.exports = {
    'url' : process.env.MONGO_CONN_URL// Connection string format mongodb://<user>:<pass>@quantumnew.azurewebsites.net:27017/dbname
};
