var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var topKeywordsSchema = new Schema({
        name              : String,
        size    : String,
        weight   : String,
        tweet       : Array,
        username          : String,
        session_id        : String
    },
    {
        timestamps: true
    });

// create the model for users and expose it to our app
module.exports = mongoose.model('topKeywords', topKeywordsSchema);
