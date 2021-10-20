/*
#title           : user.js
#description     : Mongoose schema for user details
#author		       : Nikul Prajapati
#email           : nikulprajapati90@gmail.com
#date            : 20150717
#version         : 1.0
*/

// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var Schema = mongoose.Schema;
// define the schema for our user model
var userSchema = mongoose.Schema({

    twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String,
        tokenSecret  : String,
        imageUrl     : String,
        socketId     : String,
        loginAt      : Date,        
        companyProfile  : {type: Schema.Types.ObjectId, ref: 'companiesProfile'}
    }
},
{
    timestamps: true
});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
