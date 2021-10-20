var mongoose = require('mongoose');
var db = mongoose.connection;

db.on('error', console.error);
db.once('open', function() {
  //schemas and models.
});
// var configDB = require('../../config/database');
// mongoose.connect(configDB.url);


var DynamicFields = require('../../app/models/dynamic_field_options');
var fieldData = require('./data');

var dyFields = new DynamicFields;
DynamicFields.findOne().sort({$natural: -1}).limit(1).exec(function(err, data){
    if(err){
        console.log(err);
    }
    else if(!data){
      fieldData.tweets_classifications.forEach(function (val) {
          dyFields.tweets_classifications.push(val);
      });
      dyFields.update({tweets_classifications:dyFields.tweets_classifications}, {upsert: true}, function(err, iList) {
          if (err){
            console.log(err)
          }
      });
    }
})
