var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var classificationSchema = new Schema({
    field      : String,
    label      : String,
    id         : String
});
// define the schema for our user model
var dynamicFieldSchema = new Schema({
        tweets_classifications : [classificationSchema]
    },
    {
        timestamps: true
    });

// create the model for users and expose it to our app
module.exports = mongoose.model('DynamicFields', dynamicFieldSchema);
