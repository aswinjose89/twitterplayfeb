var mongoose = require('mongoose');
var db = mongoose.connection;

db.on('error', console.error);
db.once('open', function() {
  //schemas and models.
});
// var configDB = require('../config/database');
//Change database name here
// mongoose.connect('mongodb://quantumnew.cloudapp.net:27017/twitterplay1');
// mongoose.connect('mongodb://quantumnew.cloudapp.net:27017/twitterplay9');
// mongoose.connect(configDB.url);
// mongoose.connect('mongodb://quantumnew.cloudapp.net:27017/quantumtp');
// mongoose.connect('mongodb://10.6.9.32:27017/db1');
// mongoose.connect('mongodb://quantumnew.cloudapp.net:27017/quantumplay');


var ignoreList = new mongoose.Schema({
   _id: String
,  words: []
});

//Change collection name here
var Ignore_List = mongoose.model('lists', ignoreList);

var iList = new Ignore_List;
iList._id = 'ignore_list';
var fs  = require("fs");
var path = require('path');
var ignore_file_path = path.join(__dirname, 'ignore_list.txt');
var read_ignore_file = fs.readFileSync(ignore_file_path,'utf8');
if(read_ignore_file.replace(/(^[ \t]*\n)/gm, "").length>0){
    read_ignore_file.toString().split('\n').forEach(function (line) {
        console.log(line);
        iList.words.push(line);
    });

    iList.update({words:iList.words}, {upsert: true}, function(err, iList) {
        if (err) return console.error(err);
        console.dir(iList);
        // fs.truncate(ignore_file_path, 0, function(){console.log('Ignore File List has been Truncated')})
    });
}
