function TweetsHandler() {
  this.underscore = require('underscore')
}
var DataCollectionHandler = require('./data_collection_handler')
var collectionHandler = new DataCollectionHandler()
TweetsHandler.prototype.getLiveTweets = function(req, http, keywordMap, logger, client, tweetsArray, allSocketConnection) {
  var io = require('socket.io')(http, {
      path: '/process_live_tweets' // Set path to maintain different connection with different session
  });
//   var realPath = __dirname;
//   realPath = realPath.substring(0, realPath.length - 4);
//   var count = 1
//   var tweetsQueue = [];
  io.of("/process_live_tweets").on("connection", function(socket) {
      allSocketConnection.push(socket);
    var liveTweetsStreamerModel = require('../models/live_tweets_streamers');    
    const pipeline = [
        { $match: { 'fullDocument.username': loginUserDtls.username }},
    ];
    const changeStream = liveTweetsStreamerModel.watch(pipeline);
    changeStream.on('change', (next) => {
        let streamingData = next.fullDocument;
        socket.emit('takeTweet', streamingData, keywordMap);
    });
    // var twtIndex = tweetsArray.length;
    // function processTweetsQueue() {
    //     if (twtIndex > 0 && twtIndex<=tweetsArray.length) {
    //         debugger
    //         var tweet = tweetsArray[twtIndex-1];
    //         socket.emit('takeTweet', tweet, keywordMap);
    //         twtIndex++;
    //         setTimeout(processTweetsQueue, 0);
    //     } else {
    //         setTimeout(processTweetsQueue, 500);
    //     }
    // }
    // processTweetsQueue();
  });
}

TweetsHandler.prototype.changeMultipleFriendship = function(socket, clientREST, user_ids, flag, logger) {
  var user_count = user_ids.length;
  var api_success_count = 0;
  var api_name = (flag == 'FOLLOW') ? 'create.json' : 'destroy.json';
  this.underscore.each(user_ids, function(val, key) {
      var params = {
          user_id: val.user_id
      };
      clientREST.post('friendships/' + api_name, params, function(error, userDtl, response) {
          if (error) {
              if (flag == 'FOLLOW') {
                  socket.emit('followResult', 'failed', error, val)
              } else {
                  socket.emit('unfollowResult', 'failed', error, val)
              }
          } else {
              api_success_count++;
              val.success = true;
              if (user_count === api_success_count) {
                  if (flag == 'FOLLOW') {
                      socket.emit('followResult', 'success', false, false, user_ids)
                  } else {
                      socket.emit('unfollowResult', 'success', false, false, user_ids)
                  }
              }
          }
      });
  });

}
TweetsHandler.prototype.changeFriendship = function(socket, clientREST, user_id, flag, logger) {
  var params = {
      user_id: user_id
  };
  var api_name = (flag == 'FOLLOW') ? 'create.json' : 'destroy.json';
  clientREST.post('friendships/' + api_name, params, function(error, userDtl, response) {
      if (error) {
          if (flag == 'FOLLOW') {
              socket.emit('singlefollowResult', 'failed', error)
          } else {
              socket.emit('singleunfollowResult', 'failed', error)
          }
          console.error('Found Expection at Individual Follow users.', error)
      } else {
          if (flag == 'FOLLOW') {
              socket.emit('singlefollowResult', 'success')
          } else {
              socket.emit('singleunfollowResult', 'success')
          }
      }
  });
}
module.exports = TweetsHandler