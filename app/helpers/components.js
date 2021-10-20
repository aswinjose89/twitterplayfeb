var _ = require('underscore');
function Components() {
    this.sessionstorage = require('sessionstorage');
}
Components.prototype.setLoginSessionDtl = function(userData) {
    if(userData){
        var login_dtl = {
            id          : userData.id,
            profile_id  : userData.twitter.id,
            token       : userData.twitter.token,
            username    : userData.twitter.username,
            displayName : userData.twitter.displayName,
            tokenSecret : userData.twitter,
            imageUrl :userData.imageUrl
        }
        this.sessionstorage.setItem('user_dtl', login_dtl)

    }
}
Components.prototype.urlify = function(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
        return `<span class="anchor"><a href='${url}' target="_blank">${url}</a></span>`;
    })
}
Components.prototype.hashtagCloudView = function(req, res, http, hastagCloud, appSettings, tweetsArray){
  var io = require('socket.io')(http,{
    path: '/hashtag_cloud_tweets'   // Set path to maintain different connection with different session
  });
  var live_tweets_streamer = require('../models/live_tweets_streamers');
  res.render('dashboard/hashtag_cloud_tweets.ejs', {
      user : req.user,
      flag:"HASHTAG",
      title: "Hashtag Cloud Tweets",
      appSettings: JSON.stringify(appSettings)
  });
  io.of("/hashtag_cloud_tweets").on("connection", function(socket) {
      try{
        hastagCloud = hastagCloud.tweets.find(x=>x.name == hastagCloud.name);
        let hastagCloudName = hastagCloud.name, hastagCloudTweets = hastagCloud.tweet;        
        // let hashCloudTwtListFn= function(hastagCloudTweetsTemp, tweetsArray){
        //   let hashCloudTwt = [];
        //   hastagCloudTweetsTemp.forEach((twtId)=>{
        //     let twtObjTmp = tweetsArray.find(x=>x.id_str == twtId);
        //     hashCloudTwt.push(twtObjTmp);
        //   });
        //   return hashCloudTwt;
        // }        
        socket.on("LoadMoreHashtagCloudTweets", function(currPage, size=10){
          let startIndex = (currPage-1)*size;
          let endIndex = currPage*size;
          var hastagCloudTweetsTemp = hastagCloudTweets.slice(startIndex, endIndex);

          live_tweets_streamer.find({"id_str":{$in: hastagCloudTweetsTemp}}).exec((err, hashCloudTwtList) =>{
            debugger
              if (err) {
                  logger.error('error', 'live_tweets_streamer Not Found due to the Exception: %s', err);
              } else {   
                // let hashCloudTwtList = hashCloudTwtListFn(hastagCloudTweetsTemp, tweetsArray);
                // socket.emit("hashtagCloudTweets", hashCloudTwtList, hastagCloudName, hastagCloudTweets.length, endIndex)
                socket.emit("hashtagCloudTweets", hashCloudTwtList, hastagCloudName, hastagCloudTweets.length, endIndex)
              }
          });  

          
        });
      }
      catch(err){
        var random_id = Math.trunc(Math.random() + new Date().getTime());
        var loggedin_user= loginUserDtls.username;
        logger.log("error", 'FileName:routes.js, Error Id: %s ,Hashtag Cloud API Exception for the user:%s', random_id, loggedin_user, {
            "Exception": err,
            "ApiName": "hashtagCloud"
        });
        this.exceptionEmail(transporter, logger, `TwitterPlay(${loggedin_user}): Hashtag Cloud API Exception`, err.stack, loggedin_user, random_id);
                          
        bugsnagServer.notify(new Error(err.stack), {
            severity: 'error'
        });
      }
  });
}
Components.prototype.historyHashtagCloudView = function(req, res, http, hastagCloud, appSettings){
  var io = require('socket.io')(http,{
    path: '/hashtag_cloud_tweets'   // Set path to maintain different connection with different session
  });
  var LiveTweets = require('../models/live_tweets');
  res.render('dashboard/hashtag_cloud_tweets.ejs', {
      user : req.user,
      flag:"HASHTAG",
      title: "Hashtag Cloud Tweets",
      appSettings: JSON.stringify(appSettings)
  });
  io.of("/hashtag_cloud_tweets").on("connection", function(socket) {
      try{
        debugger
        hastagCloud = hastagCloud.tweets.find(x=>x.name == hastagCloud.name);
        let hastagCloudName = hastagCloud.name, hastagCloudTweets = hastagCloud.tweet;         
        socket.on("LoadMoreHashtagCloudTweets", function(currPage, size=10){
          debugger
          let startIndex = (currPage-1)*size;
          let endIndex = currPage*size;
          var hastagCloudTweetsTemp = hastagCloudTweets.slice(startIndex, endIndex);
          LiveTweets.find({"id_str":{$in: hastagCloudTweetsTemp}}).exec((err, tweets) =>{
            debugger
              if (err) {
                  logger.error('error', 'LiveTweets Not Found due to the Exception: %s', err);
                  // res.json({
                  //     "status": "error"
                  // });
              } else {   
                let hashCloudTwtList = tweets;
                socket.emit("hashtagCloudTweets", hashCloudTwtList, hastagCloudName, hastagCloudTweets.length, endIndex)
              }
          });
          
        });
      }
      catch(err){
        var random_id = Math.trunc(Math.random() + new Date().getTime());
        var loggedin_user= loginUserDtls.username;
        logger.log("error", 'FileName:routes.js, Error Id: %s ,Hashtag Cloud API Exception for the user:%s', random_id, loggedin_user, {
            "Exception": err,
            "ApiName": "hashtagCloud"
        });
        this.exceptionEmail(transporter, logger, `TwitterPlay(${loggedin_user}): Hashtag Cloud API Exception`, err.stack, loggedin_user, random_id);
                          
        bugsnagServer.notify(new Error(err.stack), {
            severity: 'error'
        });
      }
  });
}
Components.prototype.keywordCloudView = function(req, res, http, keywordCloud, appSettings, tweetsArray){
  var io = require('socket.io')(http,{
    path: '/keyword_cloud_tweet'   // Set path to maintain different connection with different session
  });
  debugger
  var live_tweets_streamer = require('../models/live_tweets_streamers');
  res.render('dashboard/word_cloud_tweets.ejs', {
      user : req.user,
      flag:"KEYWORD",
      title: "Keyword Cloud Tweets",
      appSettings: JSON.stringify(appSettings)
  });
  io.of("/keyword_cloud_tweet").on("connection", function(socket) {
    try{
      debugger
        keywordCloud = keywordCloud.tweets.children.find(x=>x.name == keywordCloud.name);
        let keywordCloudName = keywordCloud.name, keywordCloudTweets = keywordCloud.tweet;        
        // let keywordCloudTwtListFn= function(keywordCloudTweetsTemp, tweetsArray){
        //   let cloudTwts = [];
        //   keywordCloudTweetsTemp.forEach((twtId)=>{
        //     let twtObjTmp = tweetsArray.find(x=>x.id_str == twtId);
        //     cloudTwts.push(twtObjTmp);
        //   });
        //   return cloudTwts;
        // }        
        socket.on("LoadMoreKeywordCloudTweets", function(currPage, size= 10){
          let startIndex = (currPage-1)*size;
          let endIndex = currPage*size;
          var keywordCloudTweetsTemp = keywordCloudTweets.slice(startIndex, endIndex);
          debugger
          live_tweets_streamer.find({"id_str":{$in: keywordCloudTweetsTemp}}).exec((err, keywordCloudTwtList) =>{
            debugger
              if (err) {
                  logger.error('error', 'live_tweets_streamer Not Found due to the Exception: %s', err);
              } else {   
                // let keywordCloudTwtList = keywordCloudTwtListFn(keywordCloudTweetsTemp, tweetsArray);
                socket.emit("keywordCloudTweets", keywordCloudTwtList, keywordCloudName, keywordCloudTweets.length, endIndex)
              }
          });          
        });
    }
    catch(err){
          var random_id = Math.trunc(Math.random() + new Date().getTime());
          var loggedin_user= loginUserDtls.username;
          logger.log("error", 'FileName:routes.js, Error Id: %s ,Hashtag Cloud API Exception for the user:%s', random_id, loggedin_user, {
              "Exception": err,
              "ApiName": "hashtagCloud"
          });
          this.exceptionEmail(transporter, logger, `TwitterPlay(${loggedin_user}): Hashtag Cloud API Exception`, err.stack, loggedin_user, random_id);
                            
          bugsnagServer.notify(new Error(err.stack), {
              severity: 'error'
          });
    }
      
  });

}

Components.prototype.HistoryKeywordCloudView = function(req, res, http, keywordCloud, appSettings){
  var io = require('socket.io')(http,{
    path: '/keyword_cloud_tweet'   // Set path to maintain different connection with different session
  });
  var LiveTweets = require('../models/live_tweets');
  res.render('dashboard/word_cloud_tweets.ejs', {
      user : req.user,
      flag:"KEYWORD",
      title: "Keyword Cloud Tweets",
      appSettings: JSON.stringify(appSettings)
  });
  io.of("/keyword_cloud_tweet").on("connection", function(socket) {
    try{
        keywordCloud = keywordCloud.tweets.find(x=>x.name == keywordCloud.name);
        let keywordCloudName = keywordCloud.name, keywordCloudTweets = keywordCloud.tweet;  
        socket.on("LoadMoreKeywordCloudTweets", function(currPage, size= 10){
          let startIndex = (currPage-1)*size;
          let endIndex = currPage*size;
          var keywordCloudTweetsTemp = keywordCloudTweets.slice(startIndex, endIndex);

          LiveTweets.find({"id_str": {$in: keywordCloudTweetsTemp}}).exec((err, tweets) =>{
              if (err) {
                  logger.error('error', 'LiveTweets Not Found due to the Exception: %s', err);
              } else {   
                let keywordCloudTwtList = tweets;
                socket.emit("keywordCloudTweets", keywordCloudTwtList, keywordCloudName, keywordCloudTweets.length, endIndex)
              }
          });
        });
    }
    catch(err){
          var random_id = Math.trunc(Math.random() + new Date().getTime());
          var loggedin_user= loginUserDtls.username;
          logger.log("error", 'FileName:routes.js, Error Id: %s ,Hashtag Cloud API Exception for the user:%s', random_id, loggedin_user, {
              "Exception": err,
              "ApiName": "hashtagCloud"
          });
          this.exceptionEmail(transporter, logger, `TwitterPlay(${loggedin_user}): Hashtag Cloud API Exception`, err.stack, loggedin_user, random_id);
                            
          bugsnagServer.notify(new Error(err.stack), {
              severity: 'error'
          });
    }
      
  });

}
Components.prototype.randomColorCodeGenerator = function() {
  return '#' + (Math.random().toString(16) + "000000").substring(2,8);
}
Components.prototype.get_tweet_text = function(tweet){
  return (tweet.extended_tweet && tweet.extended_tweet.full_text)?tweet.extended_tweet.full_text:
                  (tweet.retweeted_status && tweet.retweeted_status.extended_tweet && tweet.retweeted_status.extended_tweet.full_text)?tweet.retweeted_status.extended_tweet.full_text:
                  tweet.text;
}

Components.prototype.exceptionEmail = function(transporter,logger, subject, err, loggedin_user_screen_name, random_id){
  var emailSubject = `TwitterPlay: Uncaught Exception for the user ${loggedin_user_screen_name}, Error ID: ${random_id}`;
  var mailOptions = {
      from: '"Quantum Ventura Tech support" <aswin1906@gmail.com>', // sender address
      to: 'aswinjose89@gmail.com', // list of receivers
      subject: `TwitterPlay: Uncaught Exception for the user ${loggedin_user_screen_name}, Error ID: ${random_id}`, // Subject line
      html: '<b>'+ emailSubject +'</b> <br><br> '+err // html body
  };
  transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        logger.log("error", 'Email Failed for user:%s, Exception Details:%s',loggedin_user_screen_name, error);
      }
  });
}


Components.prototype.HistoryUsersView = function(req, res, page_dtls) {
  res.render('history/users_list_histry.ejs', {
      page_dtls,
      user: req.user, // get the user out of session and pass to template
      page_name: page_dtls.page_name,
      appSettings: JSON.stringify(appSettings)
  });
}
module.exports = Components
