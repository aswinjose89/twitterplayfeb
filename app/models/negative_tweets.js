var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var negTwtsSchema = new Schema({
      profile_image_url_https: String,
      screen_name: String,
      language: String,
      name: String,
      location: String,
      text: String,
      polarity: String,
      username   : String,
      session_id    : String
    },
    {
        timestamps: true
    });

// create the model for users and expose it to our app
module.exports = mongoose.model('negativeTweets', negTwtsSchema);
