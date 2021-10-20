var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var liveTweetsSchema = new Schema({
        company_code      : String,
        division_code     : String,
        username: String,
        custom_matching_keywords: Array,
        custom_keywords: Array,
        tweet_id: String,
        id_str: String,
        created_at: String,
        name: String,
        screen_name: String,
        location: String,
        text:  String,
        language: String,
        user_description: String,
        followers_count: Number,
        friends_count: Number,
        profile_banner_url: String,
        statuses_count: Number,
        profile_image_url_https: String,
        favorites_count: Number,
        created_at_time: String,
        utc_offset: String,
        time_zone: String,
        geo_enabled: String,
        geo: String,
        coordinates: String,
        place: String,
        possibly_sensitive: String,
        filter_level: String,
        source: String,
        verified: String,
        RT_ID_str: String,
        RT_when_created: String,
        RT_screen_name: String,
        RT_count: Number,
        tweets_flag: String,
        session_id: String,
        retweet: Object,
        entities: Object,
        createdAt: Date,
        updatedAt: Date
    });
    liveTweetsSchema.index({ tweet_id_str: 1, username: 1 });
// create the model for users and expose it to our app
module.exports = mongoose.model('liveTweetsStreamers', liveTweetsSchema);
