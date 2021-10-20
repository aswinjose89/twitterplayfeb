var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define the schema for our user model
var liveTweetsSchema = new Schema({
        tweet_id: String,
        tweet_id_str: String,
        actions: {
          is_important: Boolean,
          category: String,
          classification: String,
          users: Array
        }
    },
    {
        timestamps: true
    });

// create the model for users and expose it to our app
module.exports = mongoose.model('liveTweetsAction', liveTweetsSchema);
