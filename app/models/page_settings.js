var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// define the schema for our pageSettings model
var pageSettingsSchema = new Schema({
        contacts         : Schema.Types.Mixed,
        footer           : String,
        version          : Number
    },
    {
        timestamps: true
    });

// create the model for pageSettings and expose it to our app
module.exports = mongoose.model('pageSettings', pageSettingsSchema);
