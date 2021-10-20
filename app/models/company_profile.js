var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('./user');
// define the schema for our user model
var companiesProfileSchema = new Schema({
        user              : {type: Schema.Types.ObjectId, ref: 'User'},
        company_name      : String,
        company_address   : String,
        company_code      : String,
        division_code     : String,
        company_phone_no  : String,
        licence_type      : String,
        email             : String,
        status            : String
    },
    {
        timestamps: true
    });

// create the model for users and expose it to our app
module.exports = mongoose.model('companiesProfile', companiesProfileSchema);
