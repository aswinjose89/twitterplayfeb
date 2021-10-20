var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// define the schema for our user model
var tempMapStoreSchema = new Schema({
        lat         : Number,
        lng         : Number,
        screen_name : String,
        location : String,
        text : String,
        profile_image_url_https : String,
        name : String,
        tweet_id_str: String,
        username    : String,
        session_id  : String
    },
    {
        timestamps: true
    });

// create the model for users and expose it to our app
module.exports = mongoose.model('tempMapStore', tempMapStoreSchema);
