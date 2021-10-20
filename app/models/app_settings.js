var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// define the schema for our appSettings model
var appSettingsSchema = new Schema({
        appConfig               : Schema.Types.Mixed,
        twitterConfig           : Schema.Types.Mixed,
        default_values_server   : Schema.Types.Mixed,
        default_values_client   : Schema.Types.Mixed,
        nodemailer              : Schema.Types.Mixed,
        payment                 : Schema.Types.Mixed,
        version                 : Number
    },
    {
        timestamps: true
    });

// create the model for appSettings and expose it to our app
module.exports = mongoose.model('appSettings', appSettingsSchema);
