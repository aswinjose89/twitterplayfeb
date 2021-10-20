var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// define the schema for our user model
var auditLogSchema = new Schema({
        user              : {type: Schema.Types.ObjectId, ref: 'User'},
        total_tweets      : String,
        username          : String,
        session_id        : String,
        logoutAt          :  { type: Date, default: null },  
        logoutStatus      : Boolean     
    },
    {
        timestamps: true
    });

// create the model for users and expose it to our app
module.exports = mongoose.model('userAuditLogs', auditLogSchema);
