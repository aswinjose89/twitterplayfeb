var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var topMaxRetweetsSchema = new Schema({
    	retweet_id: String,
    	retweet_id_str: String,
    	retweet_user_name: String,
    	retweet_user_screen_name: String,
    	retweet_user_profile_image_url_https: String,
    	retweet_user_location: String,
    	retweet_count: String,
    	retweet_text: String,
    	username: String,
    	session_id: String
    },
    {
        timestamps: true
    });

// create the model for users and expose it to our app
module.exports = mongoose.model('topMaxRetweets', topMaxRetweetsSchema);
