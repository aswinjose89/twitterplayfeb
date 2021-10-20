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
