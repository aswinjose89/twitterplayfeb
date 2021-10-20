var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var topMostInfluentialUsersSchema = new Schema({
        name        : String,
        screen_name         : String,
        statuses_count      : String,   //Number of tweets
        followers_count     : String,
        username    : String,
        session_id  : String
    },
    {
        timestamps: true
    });

// create the model for users and expose it to our app
module.exports = mongoose.model('topMostInfluentialUsers', topMostInfluentialUsersSchema);
