var app_settings = require('./app_settings.json');   
app_settings= require('../environment.js')(app_settings);

module.exports = {

    //localhost
    'node_machine' : app_settings.appConfig.node_machine,
    'mongodb_machine' : app_settings.appConfig.mongodb_machine,
    'dbname' : app_settings.appConfig.dbname,
    'protocol' : app_settings.appConfig.protocol,
    'static_url' : app_settings.appConfig.static_url,
    'download_path': app_settings.appConfig.download_path,

    "twitter_consumer_key": app_settings.twitterConfig.twitter_consumer_key,
    "twitter_consumer_secret": app_settings.twitterConfig.twitter_consumer_secret
};
