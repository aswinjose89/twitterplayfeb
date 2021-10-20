/*
#title           : list.js
#description     : Mongoose schema for ignore list
#author		       : Nikul Prajapati
#email           : nikulprajapati90@gmail.com
#date            : 20150717
#version         : 1.0
*/

var mongoose = require('mongoose');
var listSchema = mongoose.Schema({
        words: Array
});

module.exports = mongoose.model('list', listSchema);
