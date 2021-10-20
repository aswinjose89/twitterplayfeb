var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// define the schema for our user model
var customKeywordsSchema = new Schema({
        session_id      : String,
        custom_keywords : [],
        username        : String,
        user  : {type: Schema.Types.ObjectId, ref: 'User'}

    },
    {
        timestamps: true
    });

// create the model for users and expose it to our app
module.exports = mongoose.model('customKeywords', customKeywordsSchema);
