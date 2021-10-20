var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var allRetweetsSchema = new Schema({
      retweet_id: String,
      retweet_id_str: String,
      retweet_user_name: String,
      retweet_user_screen_name: String,
      retweet_text: String,
      retweet_user_profile_image_url_https: String,
      retweet_count: String,
      retweet_user_location: String,
      retweet_created_at: String,
      retweet_source: String,
      retweet_user_url: String,
      retweet_user_description: String,
      retweet_user_followers_count: String,
      retweet_user_friends_count: String,
      retweet_user_listed_count: String,
      retweet_user_favourites_count: String,
      retweet_user_statuses_count: String,
      retweet_user_created_at: String,
      retweet_user_utc_offset: String,
      retweet_user_time_zone: String,
      retweet_user_geo_enabled: String,
      retweet_user_lang: String,
      retweet_tweet_coordinates: String,
      retweet_tweet_place: String,
      retweet_tweet_favorite_count: String,
      retweet_tweet_filter_level: String,
      retweet_tweet_lang: String,
      profile_banner_url: String
  },
    {
        timestamps: true
    });

// create the model for users and expose it to our app
module.exports = mongoose.model('fullRetweets', allRetweetsSchema);
