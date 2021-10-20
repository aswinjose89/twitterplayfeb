/*
#title           : auth.js
#description     : Auth credentials and configs
#author		       : Nikul Prajapati
#email           : nikulprajapati90@gmail.com
#date            : 20150717
#version         : 1.0
*/
// config/auth.js

// expose our config directly to our application using module.exports
var app_config = require('./app_config.js');
module.exports = {

    'facebookAuth' : {
        'clientID'      : '1638419456399261', //  App ID
        'clientSecret'  : '25b4a969d94c5a632869e693b59e3d84', //  App Secret
        'callbackURL'   : 'http://twitterplay.azurewebsites.net/auth/facebook/callback'
    },

    'twitterAuth' : {
        'consumerKey'       : app_config.twitter_consumer_key,
        'consumerSecret'    : app_config.twitter_consumer_secret,
        'callbackURL'       : app_config.protocol+'://'+app_config.node_machine+'/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'      : 'your-secret-clientID-here',
        'clientSecret'  : 'your-client-secret-here',
        'callbackURL'   : 'http://10.6.9.31:8080/auth/google/callback'
    }

};
