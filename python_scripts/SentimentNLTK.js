/*
#title           : routes.js
#description     : This script contacts sentiment analysis server and obtains sentiments for given set of tweets.
#author		       : Nikul Prajapati
#email           : nikulprajapati90@gmail.com
#date            : 20150210
#version         : 1.2
*/


var request = require('request');

var getSentiments = function(tweetsJSON, callback){
    request({ url: 'http://tpsentiment.cloudapp.net:9090',
              qs: {},
              method: 'POST',
              json: tweetsJSON
            }, function(error, response, body){
                if(error) {
                     console.log("Sentiment module error: "+error);
                } else {
                     var jsonArray = JSON.parse(body.split('\r\n\r\n')[1]);
                     var posTweetsArray = [];
                     var negTweetsArray = [];
                     var neutralTweetsArray = [];
                     var negSentCount = 0;
                     var posSentCount = 0;
                     var neutralSentCountn = 0;

                     for(var i=0; i<jsonArray.length; i++){
                        if(jsonArray[i].sentiment === 'pos'){
                          posTweetsArray.push({sentiment:"pos", tweet:jsonArray[i].tweet});
                          posSentCount++;
                        }
                        else if(jsonArray[i].sentiment === 'neg'){
                          negTweetsArray.push({sentiment:"neg", tweet:jsonArray[i].tweet});
                          negSentCount++;
                        }
                     }
                     callback(posTweetsArray, negTweetsArray, neutralTweetsArray, posSentCount, negSentCount, neutralSentCount);
                }
          });
}

module.exports.getSentiments = getSentiments;


var request = require('request');

var getSentiments = function(tweetsJSON, callback){
    var jsonObjectFinal = {"data": tweetsJSON};
    //console.log(jsonObjectFinal);
    request({ url: 'http://www.sentiment140.com/api/bulkClassifyJson',
              qs: {},
              method: 'POST',
              json: jsonObjectFinal
            }, function(error, response, body){
                if(error) {
                     console.log("Sentiment module error: "+error);
                } else {
                    //console.log(body);
                     var jsonArray = body.data;
                     var posTweetsArray = [];
                     var negTweetsArray = [];
                     var neutralTweetsArray = [];
                     var negSentCount = 0;
                     var posSentCount = 0;
                     var neutralSentCount = 0;

                     for(var i=0; i<jsonArray.length; i++){
                        if(jsonArray[i].polarity === 4){
                          posTweetsArray.push(jsonArray[i]);
                          posSentCount++;
                        }
                        else if(jsonArray[i].polarity === 0){
                          negTweetsArray.push(jsonArray[i]);
                          negSentCount++;
                        }else if(jsonArray[i].polarity === 2){
                          neutralTweetsArray.push(jsonArray[i]);
                          neutralSentCount++;
                        }
                     }
                     callback(posTweetsArray, negTweetsArray, neutralTweetsArray, posSentCount, negSentCount, neutralSentCount);
                }
          });
}

module.exports.getSentiments = getSentiments;
