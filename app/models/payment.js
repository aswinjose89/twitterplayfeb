var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// define the schema for our pageSettings model
var paymentSchema = new Schema({
        username            : String,
        billing_postal_code : String,
        card_brand          : String,
        exp_date            : Schema.Types.Mixed,
        card_last_4_digit   : String,
        transactionStatus   : String
    },
    {
        timestamps: true
    });

// create the model for pageSettings and expose it to our app
module.exports = mongoose.model('payment', paymentSchema);
