/*
#title           : myjs.js
#description     : Custom JS for front-end
#author		       : Nikul Prajapati
#email           : nikulprajapati90@gmail.com
#date            : 20160210
#version         : 1.2
*/
  // var socket = io.connect('https://quantumplay5.azurewebsites.net', {'force new connection': true});
  //var socket = io.connect('https://quantumplay2.azurewebsites.net', {'force new connection': true});
  // var socket = io.connect('http://quantumtp.cloudapp.net', {'force new connection': true});
   //var socket = io.connect('https://twitterplay1.azurewebsites.net', {'force new connection': true});
  //var socket = io.connect('https://twitterplay9.azurewebsites.net', {'force new connection': true});
  //var socket = io.connect('https://quantumtp.azurewebsites.net', {'force new connection': true});
  //var socket = io.connect('http://twitterplay.cloudapp.net', {'force new connection': true});
  // var socket = io.connect('http://10.6.9.32:8080/', {'force new connection': true});
  //var socket = io.connect('http://localhost:8080/', {'force new connection': true});
  //var socket = io.connect('https://quantumplay.azurewebsites.net', {'force new connection': true});
  //var socket = io.connect('https://quantumplay4.azurewebsites.net',{'force new connection': true});
  // var socket = io.connect('https://socialzoom.azurewebsites.net',{'force new connection': true});
  var socket = io.connect('http://192.168.1.117:8080',{'force new connection': true});

  var keywordMap = new Object(); //Maintain a list of track keywords.
  var keywordMapSize = 0;
  var tweetsCount = 0;
  var startTime = 0;
  var reTweetsCount = 0;
  var saveAllFilesCount = 0;
  var saveAllFilesTracker = new Object();
  var instagramFunction = 0;
  var sentimentClassificationFunction = 0;
  var showBufferedTweets = 0;

  var WORD_CLOUD_REFRESH_DELAY;
  var INITIAL_DELAY_TOP_K_MOST_INFLUENTIAL_USERS;
  var INITIAL_DELAY_TOP_K_MOST_ACTIVE_USERS;
  var INITIAL_DELAY_TOP_K_MOST_MENTIONED_USERS;
  var INITIAL_DELAY_TOP_K_MAX_RETWEETS;
  var INITIAL_DELAY_TOP_K_INSTA_PHOTOS;
  var INITIAL_DELAY_TOP_K_SENTIMENT_COUNT;
  var INITIAL_DELAY_TOP_K_LANG_STAT;
  var FINAL_DELAY_TOP_K_MOST_INFLUENTIAL_USERS;
  var FINAL_DELAY_TOP_K_MOST_ACTIVE_USERS;
  var FINAL_DELAY_TOP_K_MOST_MENTIONED_USERS;
  var FINAL_DELAY_TOP_K_MAX_RETWEETS;
  var FINAL_DELAY_TOP_K_INSTA_PHOTOS;
  var FINAL_DELAY_TOP_K_LANG_STAT;
  var PASSWORD_TRIAL_VERSION;
  var TRIAL_TWEETS_LIMIT;
  var LANGUAGES_FOR_DISPLAY;
  var DEFAULT_NUMBER;
  var DELAY_CHECK_FOR_MAX_LIMIT;
  var MAX_LIMIT;
  var AUTOSAVE_RECORDLIMIT;
  var AUTOEXIT_BUFFERLIMIT;

  // Set the global configs to synchronous
  $.ajaxSetup({
      async: false
  });

  // $.getJSON() request is now synchronous...
  $.getJSON('/static/default_values.json' ,function(data){
    //alert("yes started");
    WORD_CLOUD_REFRESH_DELAY = data["WORD_CLOUD_REFRESH_DELAY"];
    INITIAL_DELAY_TOP_K_MOST_INFLUENTIAL_USERS = data["INITIAL_DELAY_TOP_K_MOST_INFLUENTIAL_USERS"];
    INITIAL_DELAY_TOP_K_MOST_ACTIVE_USERS = data["INITIAL_DELAY_TOP_K_MOST_ACTIVE_USERS"];
    INITIAL_DELAY_TOP_K_MOST_MENTIONED_USERS = data["INITIAL_DELAY_TOP_K_MOST_MENTIONED_USERS"];
    INITIAL_DELAY_TOP_K_MAX_RETWEETS = data["INITIAL_DELAY_TOP_K_MAX_RETWEETS"];
    INITIAL_DELAY_TOP_K_INSTA_PHOTOS = data["INITIAL_DELAY_TOP_K_INSTA_PHOTOS"];
    INITIAL_DELAY_TOP_K_SENTIMENT_COUNT = data["INITIAL_DELAY_TOP_K_SENTIMENT_COUNT"];
    INITIAL_DELAY_TOP_K_LANG_STAT = data["INITIAL_DELAY_TOP_K_LANG_STAT"];
    FINAL_DELAY_TOP_K_MOST_INFLUENTIAL_USERS = data["FINAL_DELAY_TOP_K_MOST_INFLUENTIAL_USERS"];
    FINAL_DELAY_TOP_K_MOST_ACTIVE_USERS = data["FINAL_DELAY_TOP_K_MOST_ACTIVE_USERS"];
    FINAL_DELAY_TOP_K_MOST_MENTIONED_USERS = data["FINAL_DELAY_TOP_K_MOST_MENTIONED_USERS"];
    FINAL_DELAY_TOP_K_MAX_RETWEETS = data["FINAL_DELAY_TOP_K_MAX_RETWEETS"];
    FINAL_DELAY_TOP_K_INSTA_PHOTOS = data["FINAL_DELAY_TOP_K_INSTA_PHOTOS"];
    FINAL_DELAY_TOP_K_LANG_STAT = data["FINAL_DELAY_TOP_K_LANG_STAT"];
    PASSWORD_TRIAL_VERSION = data["PASSWORD_TRIAL_VERSION"];
    TRIAL_TWEETS_LIMIT = data["TRIAL_TWEETS_LIMIT"];
    LANGUAGES_FOR_DISPLAY = data["LANGUAGES_FOR_DISPLAY"];
    DEFAULT_NUMBER = data["DEFAULT_NUMBER"];
    DELAY_CHECK_FOR_MAX_LIMIT = data["DELAY_CHECK_FOR_MAX_LIMIT"];
    MAX_LIMIT = data["MAX_LIMIT"];
	AUTOSAVE_RECORDLIMIT = data["AUTOSAVE_RECORDLIMIT"];
	AUTOEXIT_BUFFERLIMIT = data["AUTOEXIT_BUFFERLIMIT"];
  });

  // Set the global configs back to asynchronous
  $.ajaxSetup({
      async: true
  });



  var indexAdd=0;
  var indexRemove=0;
  var indexAddNeg=0;
  var indexRemoveNeg=0;
  var indexAddPos=0;
  var indexRemovePos=0;
  var indexAddNeutral=0;
  var indexRemoveNeutral=0;

  //var delay=1000;
  var delayTopKMostInfluentialUsers = INITIAL_DELAY_TOP_K_MOST_INFLUENTIAL_USERS;
  var delayTopKMostActiveUsers = INITIAL_DELAY_TOP_K_MOST_ACTIVE_USERS;
  var delayTopKMostMentionedUsers = INITIAL_DELAY_TOP_K_MOST_ACTIVE_USERS;
  var delayTopKMaxReTweets = INITIAL_DELAY_TOP_K_MAX_RETWEETS;
  var delayTopKInstaPhotos = INITIAL_DELAY_TOP_K_INSTA_PHOTOS;
  var initialDelaySentimentCount = INITIAL_DELAY_TOP_K_SENTIMENT_COUNT;
  var delayLangStat = INITIAL_DELAY_TOP_K_LANG_STAT;
  //var topKDelay = 30000;
  //var for limits for maximum buffer limit for auto exit and auto save threshold for tweetfiles
  var writelimit = AUTOSAVE_RECORDLIMIT;
  var buffermaxlimit = AUTOEXIT_BUFFERLIMIT;
  var trackingAllHashtags = false;
  var trackingAllKeywords = false;
  var trackingCustomKeywords = false;

  var startTimer;
  var time = 0;
  var timerClockDelay = 1000;
  var limitreached = "N"; // maximum number of records processed
  var maxcounter = 0;
  var tweetWriteLimitreached = "N";
  var tweetwritemaxcounter = 0;

  var TwBufferLimitreached = "N";
  var twBufferMaxcounter = 0;
  var twbuffercount = 0;
   // maximum buffer for auto exit.
  var BufferMaxProcessed = 1;
  //var dangerpoint = 0; // maximum buffer limit beyond program will autosave and exit.

  var cnfPopupFlg = 0;
  var startTimerCustomTrackFlag = 0;
  var clock = new FlipClock($('#timer_clock'), {
    autoStart: false
  });

  var prompting = false;
  var password_enabled = false;
  var password = PASSWORD_TRIAL_VERSION;

  var displayGlobalFlag = 0;

  clock.autoStart = false;

  $(function () {
      Example.init({
          "selector": ".bb-alert"
      });
  });

  $('form').submit(function(){
    socket.emit('takeTweet', $('#m').val());
    $('#m').val('');
    return false;
  });


  /**
   * This tiny script just helps us demonstrate
   * what the various example callbacks are doing
   */
  var Example = (function() {
      "use strict";

      var elem,
          hideHandler,
          that = {};

      that.init = function(options) {
          elem = $(options.selector);
      };

      that.show = function(text) {
          clearTimeout(hideHandler);

          elem.find("span").html(text);
          elem.delay(200).fadeIn().delay(10000).fadeOut();
      };

      return that;
  }());

  $("#btn_all_hashtag").click(function(){
    var thisButton = this;
    if(cnfPopupFlg){
      bootbox.confirm("This operation will clear the current screen. Do you still want to continue?", function(result) {
          if(result==true){

            trackingAllHashtags = true;
            trackingAllKeywords = false;
            trackingCustomKeywords = false;

            clearAll();
            socket.emit("trackallhashtags", "No Data!");
            Example.show("Tracking started for all hashtag");
            $("#inputkeyword").attr("disabled", true);
            $(".btn-group-vertical > .btn").removeClass("active");
            $(thisButton).addClass("active");
            clock.setTime(0); //FilpClock comment
            clock.start(); //FilpClock comment
            //clearTimer();
            //startTimer();
          }
      });
    }else{
        trackingAllHashtags = true;
        trackingAllKeywords = false;
        trackingCustomKeywords = false;
        socket.emit("trackallhashtags", "No Data!");
        Example.show("Tracking started for all hashtag");
        $("#inputkeyword").attr("disabled", true);
        $(".btn-group-vertical > .btn").removeClass("active");
        $(thisButton).addClass("active");
        clock.setTime(0); //FilpClock comment
        clock.start(); //FilpClock comment
        //clearTimer();
        //startTimer();
    }
    cnfPopupFlg=1;

  });

  $("#btn_all_keyword").click(function(){
    var thisButton = this;
    if(cnfPopupFlg){
      bootbox.confirm("This operation will clear the current screen. Do you still want to continue?", function(result) {
          if(result==true){
            clearAll();
            trackingAllHashtags = false;
            trackingAllKeywords = true;
            trackingCustomKeywords = false;
            socket.emit("trackallkeywords", "No Data!");
            Example.show("Tracking started for all keywords");
            $("#inputkeyword").attr("disabled", true);
            $(".btn-group-vertical > .btn").removeClass("active");
            $(thisButton).addClass("active");
            clock.setTime(0); //FilpClock comment
            clock.start(); //FilpClock comment
            //clearTimer();
            //startTimer();
          }
      });
    }else{
        trackingAllHashtags = false;
        trackingAllKeywords = true;
        trackingCustomKeywords = false;

        socket.emit("trackallkeywords", "No Data!");
        Example.show("Tracking started for all keywords");
        $("#inputkeyword").attr("disabled", true);
        $(".btn-group-vertical > .btn").removeClass("active");
        $(thisButton).addClass("active");
        clock.setTime(0); //FilpClock comment
        clock.start(); //FilpClock comment
        //clearTimer();
        //startTimer();
    }
    cnfPopupFlg=1;
  });

  $("#btn_custom_keyword").click(function(){
    var thisButton = this;
    if(cnfPopupFlg){
      bootbox.confirm("This operation will clear the current screen. Do you still want to continue?", function(result) {
          if(result==true){
            trackingAllHashtags = false;
            trackingAllKeywords = false;
            trackingCustomKeywords = true;

            clearAll();
            Example.show("Enter hashtag or keyword in the textbox provided");
            $("#inputkeyword").attr("disabled", false);
            $(".btn-group-vertical > .btn").removeClass("active");
            $(thisButton).addClass("active");

          }
      });
    }else{
      trackingAllHashtags = false;
      trackingAllKeywords = false;
      trackingCustomKeywords = true;

      Example.show("Enter hashtag or keyword in the textbox provided");
      $("#inputkeyword").attr("disabled", false);
      $(".btn-group-vertical > .btn").removeClass("active");
      $(thisButton).addClass("active");
    }
    cnfPopupFlg=1;

  });


  socket.on('takeTweet', function(msg){
    //$('#messages').prepend($('<li>').text(msg.text));
    if(tweetsCount == 0){
      startTime =  new Date().getTime();
    }

    if(msg.coordinates!=null)
	addMarkerToMap(msg.coordinates.coordinates[1], msg.coordinates.coordinates[0], msg.text, msg.user.profile_image_url_https, msg.user.name, msg.user.screen_name, msg.user.location);
    keepadd(msg.text, msg.user.profile_image_url_https, msg.user.name, msg.user.screen_name, msg.user.location);
    tweetsCount++;
    var retweeted_status = msg.retweeted_status;
    if(retweeted_status && retweeted_status !== "null" && retweeted_status!== "undefined"){
      reTweetsCount++;
    }

    if (tweetsCount > TRIAL_TWEETS_LIMIT && !password_enabled && !prompting) {
         prompting=true;
         var pass = prompt('Please enter password to continue using the application');
         if(!(pass===password)){
             logout();
         }
         password_enabled=true;
         prompting=false;
    }
	tweetWriteLimitreached = "N";
	tweetwritemaxcounter = 0;

	if (tweetsCount % writelimit === 0) {
		tweetWriteLimitreached = "Y";
		tweetwritemaxcounter++;
		checkforTweetWrite();
	}
	TwBufferLimitreached = "N";
      //twBufferMaxcounter = 0;
	  //BufferMaxProcessed = 0;

	if (twbuffercount  >= buffermaxlimit  && twBufferMaxcounter < 1){

      TwBufferLimitreached = "Y";
      twBufferMaxcounter++;
	  bufferExceededTweetWrite();
	}


	displayTotalTweets(tweetsCount);
	displayTotalReTweets(reTweetsCount);
	displayReTweetPercentage(tweetsCount, reTweetsCount);
	displayThroughput(tweetsCount);
	});

  socket.on('takeNegTweet', function(msg){
    if(sentimentClassificationFunction === 1){
      keepaddNeg(msg.text, msg.profile_image_url_https, msg.name, msg.screen_name, msg.location);
    }
  });

  socket.on('takePosTweet', function(msg){
    if(sentimentClassificationFunction === 1){
      keepaddPos(msg.text, msg.profile_image_url_https, msg.name, msg.screen_name, msg.location);
    }
  });

  socket.on('takeNeutralTweet', function(msg){
    if(sentimentClassificationFunction === 1){
      keepaddNeutral(msg.text, msg.profile_image_url_https, msg.name, msg.screen_name, msg.location);
    }
  });


  function getConfirmation(){
    bootbox.confirm("Are you sure?", function(result) {
        Example.show("Confirm result: "+result);
    });
  }

  function setPlaceHolder(text){
    $("#inputkeyword").attr("placeholder", text);
  }

  function enableMe(id){
    $("#"+id).attr("disabled", false);
  }

  function disableMe(id){
    $("#"+id).attr("disabled", true);
  }

  function getTopKeywordsFile(){
    $("#download").text("");
    $("#loading-indicator").show();
    socket.emit("getTopKeywordsFile", "No Data!");
  }

  function getTweetsFile(){
    //socket.emit("gettweetsfile", "No Data!");
    $("#download").text("");
    $("#loading-indicator").show();
    socket.emit("getAllTweetsFile", "No Data!");
  }




  function getTopKeywordsFileAtMaxLimit(){
    $("#download").text("");
    $("#loading-indicator").show();
    socket.emit("getTopKeywordsFile", "SaveAll!");
  }

  function getTweetsFileAtMaxLimit(){
    $("#download").text("");
    $("#loading-indicator").show();
	socket.emit("getAllTweetsFile", "SaveAll!");
	Example.show("saving All tweets please wait.... total tweets   : " + tweetsCount);
	console.log("saving All tweets  user file   "+ tweetsCount + " maxcounter = "+maxcounter);
	}

  function getMaxReTweetsFileAtMaxLimit(){
    $("#download").text("");
    $("#loading-indicator").show();
	socket.emit("getTopKMaxReTweetsFile", "SaveAll!");
	console.log("saving Retweet max  user file   "+ tweetsCount + " maxcounter = "+maxcounter);
    }

  function getTopKMostInfluentialUsersFileAtMaxLimit(){
    $("#download").text("");
    $("#loading-indicator").show();
	socket.emit("getTopKMostInfluentialUsersFile", "SaveAll!");
	console.log("saving Most influential user file   "+ tweetsCount + " maxcounter = "+maxcounter);
    }

  function getTopKMostActiveUsersFileAtMaxLimit(){
    $("#download").text("");
    $("#loading-indicator").show();
    socket.emit("getTopKMostActiveUsersFile", "SaveAll!");
	console.log("saving Active user file   "+ tweetsCount + " maxcounter = "+maxcounter);
   }
  function getAllRetweetFileAtMaxLimit(){
	$("#download").text("");
    $("#loading-indicator").show();
    socket.emit("getFullReTweetsFile", "SaveAll!");
	console.log("saving All Retweet files..    "+ tweetsCount + " maxcounter = "+maxcounter);
  }

  function getTopKMostInfluentialUsersFile(){
    $("#download").text("");
    $("#loading-indicator").show();
    socket.emit("getTopKMostInfluentialUsersFile", "No Data!");
  }

  function getTopKMostActiveUsersFile(){
    $("#download").text("");
    $("#loading-indicator").show();
    socket.emit("getTopKMostActiveUsersFile", "No Data!");
  }

  function getMaxReTweetsFile(){
    $("#download").text("");
    $("#loading-indicator").show();
    socket.emit("getTopKMaxReTweetsFile", "No Data!");

  }

  function getPosTweetsFile(){
    $("#download").text("");
    $("#loading-indicator").show();
    socket.emit("getPosTweetsFile", "No Data!");
  }

  function getNegTweetsFile(){
    $("#download").text("");
    $("#loading-indicator").show();
    socket.emit("getNegTweetsFile", "No Data!");
  }

  function getNeutralTweetsFile(){
    $("#download").text("");
    $("#loading-indicator").show();
    socket.emit("getNeutralTweetsFile", "No Data!");
  }

  function displayThroughput(count){
    var duration =  new Date().getTime() - startTime;
    duration = duration/(1000*60);
    if(duration>0){
        $("#throughput").text(Math.floor(count/duration));
    }else{
        $("#throughput").text("NA");
    }
  }

  function displayTotalTweets(count){
    $("#totalTweets").text(count);
  }

  function displayTotalReTweets(count){
    $("#totalReTweets").text(count);
  }

  function displayReTweetPercentage(totalTweets, totalRetweets){
    var percentage = 0.0;
    if(totalTweets == 0){
      percentage = 0;
    }else{
      percentage = (totalRetweets/totalTweets)*100;
    }
    $("#reTweetsPercentage").text(percentage.toFixed(2));
  }

  function displayBufferedTweets(count){
    // if(showBufferedTweets == 1)
      $("#lagging_btw_client_server").text(count);
  }

  function clearAll(){
    socket.emit("untrackall", "No Data!");
    resetGUI();
  }

	socket.on('displaycount', function(data){
	Example.show("Total keywords for twitter search : " + data);
	});

   socket.on('takeTopKeywordsFile', function(filename){
    //$("#download").attr("href", '/givemefile?name='+filename);
    if(filename != "NoFileExist"){
      changeViewFileDownload(filename);
      $("#download_words_excel").text("Update keywords file");
    }else{
      $("#loading-indicator").hide();
    }
  });

  socket.on('takeAllTweetsFile', function(filename){
    //$("#download").attr("href", '/givemefile?name='+filename);

    if(filename != "NoFileExist"){
      changeViewFileDownload(filename);
      $("#download_tweets_excel").text("Update all tweets file");
    }else{
      $("#loading-indicator").hide();
    }
  });

  socket.on('takeTopKMostActiveUsersFile', function(filename){
    //$("#download").attr("href", '/givemefile?name='+filename);
    if(filename != "NoFileExist"){
      changeViewFileDownload(filename);
      $("#download_active_users_excel").text("Update most active users list");
    }else{
      $("#loading-indicator").hide();
    }
  });

  socket.on('takeTopKMostInfluentialUsersFile', function(filename){
    //$("#download").attr("href", '/givemefile?name='+filename);
    if(filename != "NoFileExist"){
      changeViewFileDownload(filename);
      $("#download_influential_users_excel").text("Update most influential users file");
    }else{
      $("#loading-indicator").hide();
    }
  });

  socket.on('takeTopKMaxReTweetsFile', function(filename){
    //$("#download").attr("href", '/givemefile?name='+filename);
    if(filename != "NoFileExist"){
      changeViewFileDownload(filename);
      $("#download_retweets_excel").text("Update most retweeted tweets file");
    }else{
      $("#loading-indicator").hide();
    }
  });
  socket.on('takeFullRTFile', function(filename){
    //$("#download").attr("href", '/givemefile?name='+filename);
    if(filename != "NoFileExist"){
      changeViewFileDownload(filename);
      $("#download_retweets_excel").text("Update All unique retweeted tweets file");
    }else{
      $("#loading-indicator").hide();
    }
  });

  socket.on('takePosTweetsFile', function(filename){
    //$("#download").attr("href", '/givemefile?name='+filename);
    if(filename != "NoFileExist"){
      changeViewFileDownload(filename);
      $("#download_pos_tweets_excel").text("Update positive tweets file");
    }else{
      $("#loading-indicator").hide();
    }
  });

  socket.on('takeNegTweetsFile', function(filename){
    //$("#download").attr("href", '/givemefile?name='+filename);
    if(filename != "NoFileExist"){
      changeViewFileDownload(filename);
      $("#download_neg_tweets_excel").text("Update negative tweets file");
    }else{
      $("#loading-indicator").hide();
    }
  });

  socket.on('takeNeutralTweetsFile', function(filename){
    //$("#download").attr("href", '/givemefile?name='+filename);
    if(filename != "NoFileExist"){
      changeViewFileDownload(filename);
      $("#download_neutral_tweets_excel").text("Update neutral tweets file");
    }else{
      $("#loading-indicator").hide();
    }
  });

  function changeViewFileDownload(filename){
    $("#loading-indicator").hide();
    $("#download").text("\""+filename+"\" has been saved to the cloud.");
  }
  socket.on('takeLangStat', function(jsonStr){
    var jsonObj = JSON.parse(jsonStr);
    var totalCount = 0;
    var lang_for_display_count = 0;
    var sortable = [];
    var othersCount = 0;
    var langusgesToDisplay = 15;

    for(var language_id in jsonObj) {
      if(language_id != '')
        sortable.push({language:language_id, tweet_count:jsonObj[language_id]});
    }

    sortable.sort(function(a, b) {return b.tweet_count - a.tweet_count});
    //console.log(JSON.stringify(sortable));

    if( $('div#lang_stats > div').length >=1 ){
      $("#lang_stats").empty();
    }

    if(jsonObj["English"] != 0){
      for(var i=0; langusgesToDisplay > 0; i++){
          if(sortable[i].language !== 'Unidentified'){
            var newEle = '<div class="well" id=language_'+i+' style="text-align: left; margin: 2px 0px; padding:1px; height:1em; width: 10em"><span><b>'+sortable[i].language+'</b>'+' :'+sortable[i].tweet_count+'</b></span></div>';
            $("#lang_stats").append(newEle);
            lang_for_display_count += sortable[i].tweet_count;
            langusgesToDisplay--;
          }
      }

      for(var i=0; i<sortable.length; i++){
        totalCount += sortable[i].tweet_count;
      }

      var newEle = '<div class="well" id=language_'+i+' style="text-align: left; margin: 2px 0px; padding:1px; height:1em; width: 10em"><span><b>Others</b>'+' :'+(totalCount - lang_for_display_count)+'</b></span></div>';
      $("#lang_stats").append(newEle);
    }

  });

  //Display lag between client and server.
  socket.on("total_tweets_at_server", function(count){
	  displayBufferedTweets(count - tweetsCount);
	  twbuffercount = count - tweetsCount;
	  //console.log("buffer count calculation " + twbuffercount);


  });

  //socket.on("hightraffic", function(count){
	//TwBufferLimitreached = "Y";
   // bufferExceededTweetWrite();
  //});



  socket.on('takeTopKKeywords', function(jsonString){
    if(jsonString.length>35)
      drawKeywordBubbles(jsonString);
  });

  socket.on('takeTopKHashtags', function(jsonString){
    if(jsonString.length>35)
      drawHashTagBubbles(jsonString);
  });

  socket.on("takeTopKMostInfluentialUsers", function(jsonString){

    if(jsonString.length>15){ //100 is arbitrary choosen number.
      update_list_topK_user_with_max_followers(jsonString);
      delayTopKMostInfluentialUsers = FINAL_DELAY_TOP_K_MOST_INFLUENTIAL_USERS;
    }
  });

  socket.on("takeTopKMostActiveUsers", function(jsonString){
    if(jsonString.length>15){ //100 is arbitrary choosen number.
      update_list_topK_user_with_max_tweets(jsonString);
      delayTopKMostActiveUsers = FINAL_DELAY_TOP_K_MOST_ACTIVE_USERS;
    }
  });

  socket.on("takeTopKMostMentionedUsers", function(jsonString){
    if(jsonString.length>15){ //100 is arbitrary choosen number.
      update_list_topK_most_mentioned_users(jsonString);
      delayTopKMostMentionedUsers = FINAL_DELAY_TOP_K_MOST_MENTIONED_USERS;
    }
  });

  socket.on("takeTopKMaxReTweets", function(jsonString){

    if(jsonString.length>15){ //100 is arbitrary choosen number.
      update_list_topK_max_retweets(jsonString);
      delayTopKMaxReTweets = FINAL_DELAY_TOP_K_MAX_RETWEETS;
    }
  });

  socket.on("takeTopKInstaPhotos", function(jsonString){
    if(jsonString.length>15){ //100 is arbitrary choosen number.
      if(instagramFunction == 1){
        update_list_topK_insta_photos(jsonString);
        delayTopKInstaPhotos = FINAL_DELAY_TOP_K_INSTA_PHOTOS;
      }
    }
  });

  socket.on("takeSentimentCount", function(jsonStr){
      var jsonObj = JSON.parse(jsonStr);
      $("#negSentCount").text(jsonObj["negSentCount"]);
      $("#posSentCount").text(jsonObj["posSentCount"]);
      $("#neutralSentCount").text(jsonObj["neutralSentCount"]);
  });


  socket.on("twitter_error", function(msg){
    Example.show("TwitterAPI error,  auto reconnecting after 90 seconds :" + msg);
  });

  socket.on("apiwarning", function(warning){
    Example.show("Twitter buffer full warning :" + warning.code  + "  " +warning.percent_full) ;
  });

   socket.on("limitwarning", function(limit){
    Example.show("No.of undelivered tweets due to limit :" + limit.track);
  });

  socket.on('apidisconnect', function(disconnect) {
	Example.show("TwitterAPI disconnected.. saving all files.. code = " + disconnect.code);
	socket.emit("StopTracking", "NoDisconnect");
    socket.emit("getTopKeywordsFile", "SaveAll");
    socket.emit("getAllTweetsFile", "SaveAll");
	//Example.show("saving all tweets . please wait... Total tweets  " + tweetsCount);
    socket.emit("getTopKMostInfluentialUsersFile", "SaveAll");
    socket.emit("getTopKMostActiveUsersFile", "SaveAll");
    socket.emit("getTopKMaxReTweetsFile", "SaveAll");
	//Example.show("saving all tweets . please wait... Total tweets  " + tweetsCount);
    socket.emit("getPosTweetsFile", "SaveAll");
    socket.emit("getNegTweetsFile", "SaveAll");
	socket.emit("getFullReTweetsFile", "SaveAll");

    $(location).attr('href', '/logout');
  });

  socket.on('disconnect', function() {
    $(location).attr('href', '/logout');
  });


  socket.on('keywordListChanged', function(jsonString){
      update_google_trend(jsonString);
  });


  // socket.on("negSentCount", function(count){
  //     $("#negSentCount").text(count);
  // });
  //
  // socket.on("posSentCount", function(count){
  //     $("#posSentCount").text(count);
  // });


  $(window).on('beforeunload', function(){
        socket.emit("abort", "No Data!");

        socket.emit("StopTracking", "NoDisconnect");
        socket.emit("getTopKeywordsFile", "SaveAll");
        socket.emit("getAllTweetsFile", "SaveAll");
        socket.emit("getTopKMostInfluentialUsersFile", "SaveAll");
        socket.emit("getTopKMostActiveUsersFile", "SaveAll");
        socket.emit("getTopKMaxReTweetsFile", "SaveAll");
        socket.emit("getPosTweetsFile", "SaveAll");
        socket.emit("getNegTweetsFile", "SaveAll");
		socket.emit("getFullReTweetsFile", "SaveAll");

  });

  function sendData(){
      var data = $("#keywords").val();

      keywordMap[data] = 1;
      keywordMapSize++;
      socket.emit("track", data);
  }

  function untrackData(){
      var data = $("#keywords").val();
      delete keywordMap[data];
      keywordMapSize--;

      socket.emit("untrack", data);
  }

  function stopData(){
      socket.emit("stopData", "No Data!");
  }

  function clearData(){
      $('#messages').empty();
  }


  function logout(){

    bootbox.dialog({
      message: "Do you want to save all the files before you logout?",
      title: "Save Data to the cloud!",
      buttons: {
        success: {
          label: "Yes, Save it",
          className: "btn-success",
          callback: function() {
                  $("#loading-indicator").show();
                  socket.emit("StopTracking", "NoDisconnect");
                  socket.emit("getTopKeywordsFile", "SaveAll");
                  socket.emit("getAllTweetsFile", "SaveAll");
				  Example.show("saving all tweets . please wait... Total tweets  " + tweetsCount);
                  socket.emit("getTopKMostInfluentialUsersFile", "SaveAll");
                  socket.emit("getTopKMostActiveUsersFile", "SaveAll");
                  socket.emit("getTopKMaxReTweetsFile", "SaveAll");
				  Example.show("saving all tweets . please wait... Total tweets  " + tweetsCount);
                  socket.emit("getPosTweetsFile", "SaveAll");
                  socket.emit("getNegTweetsFile", "SaveAll");
				  socket.emit("getFullReTweetsFile", "SaveAll");

          }
        },
        main: {
          label: "No, just logout",
          className: "btn-primary",
          callback: function() {
            socket.emit("abort", "No Data!");
          }
        }
      }
    });

  }

  socket.on("doneSaveAll", function(data){

      if(typeof(saveAllFilesTracker[data]) == "undefined" || saveAllFilesTracker[data] == ""){
        saveAllFilesTracker[data] = true;
      }else{
        saveAllFilesTracker = new Object();
      }

      var count = Object.size(saveAllFilesTracker);
      if(count === 8){
        $("#download").text("All files have been saved to the cloud.");
        socket.emit("abort", "No Data!");
      }
  });

    Object.size = function(obj) {
      var size = 0, key;
      for (key in obj) {
          if (obj.hasOwnProperty(key)) size++;
      }
      return size;
  };

  // Get the size of an object
  //var size = Object.size(myArray);

  function updateWordCloud(){
    socket.emit("getTopKKeywordsAndHashTags", "No Data!");
    setTimeout(updateWordCloud, WORD_CLOUD_REFRESH_DELAY);
  }

  function updateTopKMostInfluentialUsers(){
    socket.emit("getTopKMostInfluentialUsers", "No Data!");
    setTimeout(updateTopKMostInfluentialUsers, delayTopKMostInfluentialUsers);
  }

  function updateTopKMostActiveUsers(){
    socket.emit("getTopKMostActiveUsers", "No Data!");
    setTimeout(updateTopKMostActiveUsers, delayTopKMostActiveUsers);
  }

  function updateTopKMostMentionedUsers(){
    socket.emit("getTopKMostMentionedUsers", "No Data!");
    setTimeout(updateTopKMostMentionedUsers, delayTopKMostMentionedUsers);
  }

  function updateTopKMaxReTweets(){
    socket.emit("getTopKMaxReTweets", "No Data!");
    setTimeout(updateTopKMaxReTweets, delayTopKMaxReTweets);
  }

  function updateTopKInstaPhotos(){
    if(instagramFunction == 1){
      socket.emit("getTopKInstaPhotos", "No Data!");
    }
    setTimeout(updateTopKInstaPhotos, delayTopKInstaPhotos);
  }

  function updateSentimentCount(){
    socket.emit("getSentimentCount", "No Data!");
    setTimeout(updateSentimentCount, initialDelaySentimentCount);
  }

  function updateLangStat(){
    socket.emit("getLangStat", "No Data!");
    setTimeout(updateLangStat, delayLangStat);
  }


  function checkForMaxLimit(){
    if(tweetsCount >= MAX_LIMIT){
		 limitreached = "Y";
		 maxcounter++;
		 console.log("counter at max limit  "+maxcounter);
		 if (maxcounter > 1) {
			 socket.emit("abort", "No Data!");
		 }
		 if (limitreached === "Y" && maxcounter ===1){
		Example.show("Saving files...Max limit reached at : " + tweetsCount);
		console.log("Maximum limit reached at   "+ tweetsCount + " maxcounter = "+maxcounter);
        socket.emit("StopTracking", "NoDisconnect");
		getTopKeywordsFileAtMaxLimit();
		getTweetsFileAtMaxLimit();
		getTopKMostInfluentialUsersFileAtMaxLimit();
		getTopKMostActiveUsersFileAtMaxLimit();
		getMaxReTweetsFileAtMaxLimit();
		socket.emit("getPosTweetsFile", "SaveAll");
        socket.emit("getNegTweetsFile", "SaveAll");
		getAllRetweetFileAtMaxLimit();
		socket.emit("maxlimitreached", tweetsCount);
	  }
    }
    setTimeout(checkForMaxLimit, DELAY_CHECK_FOR_MAX_LIMIT);
  }

function bufferExceededTweetWrite() {
	  //if (BufferMaxProcessed  == 0){
		 if (BufferMaxProcessed > 1) {
			 socket.emit("abort", "No Data!");
		 }
	  if (TwBufferLimitreached === "Y" && twBufferMaxcounter === 1 ) {
      Example.show("Server traffic exceeded..  saving files.. buffer =    " + twbuffercount );
	  socket.emit("StopTracking", "NoDisconnect");
      socket.emit("getTopKeywordsFile", "SaveAll");
      socket.emit("getAllTweetsFile", "SaveAll");
	  socket.emit("getTopKMostInfluentialUsersFile", "SaveAll");
      socket.emit("getTopKMostActiveUsersFile", "SaveAll");
      socket.emit("getTopKMaxReTweetsFile", "SaveAll");
	  socket.emit("getPosTweetsFile", "SaveAll");
      socket.emit("getNegTweetsFile", "SaveAll");
	  socket.emit("getFullReTweetsFile", "SaveAll");
	  socket.emit('servertraffic',twbuffercount);
	  //socket.emit("abort", "No Data!");
	  //$(location).attr('href', '/logout');
    }
	BufferMaxProcessed++;
	//}
	//setTimeout(bufferExceededTweetWrite, 7200);
  }

	function checkforTweetWrite() {
	if (tweetWriteLimitreached === "Y" && tweetwritemaxcounter === 1) {
     Example.show("auto saving All tweets please wait.... total tweets   : " + tweetsCount);
     socket.emit('getAllTweetsFile', "justsavethis");
    }
	if (tweetwritemaxcounter === 1){
		tweetwritemaxcounter = 0;
	}
	}

  updateWordCloud();
  updateTopKMostInfluentialUsers();
  updateTopKMostActiveUsers();
  updateTopKMostMentionedUsers();
  updateTopKMaxReTweets();
  updateTopKInstaPhotos();
  updateSentimentCount();
  updateLangStat();
  checkForMaxLimit();
  checkforTweetWrite();
  //bufferExceededTweetWrite();

  function resetGUI(){
      d3.select("#wordcloud").selectAll("svg").remove();
      d3.select("#hashtag_wordcloud").selectAll("svg").remove();
      removeAllTask();

      tweetsCount = 0;
      reTweetsCount = 0;
      displayGlobalFlag=0;

      displayTotalTweets(tweetsCount);
      displayTotalReTweets(reTweetsCount);
      displayReTweetPercentage(tweetsCount, reTweetsCount);
      displayThroughput(tweetsCount);
      displayBufferedTweets(0);
      DeleteMarkers();

      indexAdd = 0;
      indexRemove = 0;

      indexAddNeg = 0;
      indexRemoveNeg = 0;

      indexAddPos = 0;
      indexRemovePos = 0;

      indexAddNeutral = 0;
      indexRemoveNeutral = 0;

      $("#max_followers_ul").empty();
      $("#max_tweets_ul").empty();
      $("#most_mentioned_ul").empty();
      $("#retweets_window").empty();
      $("#insta_photos_window").empty();
      $("#main").html("");
      $("#lang_stats").empty();
      clock.stop(); //FlipClock commment
      clock.setTime(0); //FlipClock comment
      clearTimer();
      startTimerCustomTrackFlag=0;
      delayTopKMostInfluentialUsers = INITIAL_DELAY_TOP_K_MOST_INFLUENTIAL_USERS;
      delayTopKMostActiveUsers = INITIAL_DELAY_TOP_K_MOST_ACTIVE_USERS;
      delayTopKMostMentionedUsers = INITIAL_DELAY_TOP_K_MOST_MENTIONED_USERS;
      delayTopKMaxReTweets = INITIAL_DELAY_TOP_K_MAX_RETWEETS;
      delayTopKInstaPhotos = INITIAL_DELAY_TOP_K_INSTA_PHOTOS;
      delayLangStat = INITIAL_DELAY_TOP_K_LANG_STAT;

      $("#posSentCount").text(0);
      $("#negSentCount").text(0);
      $("#neutralSentCount").text(0);

      var langs_for_display = ["en", "fr", "de", "es", "it", "hi", "id", "zh", "ja", "ar", "ur", "ko", "vi", "th", "nl", "ru", "tr", "pt", "fa"];
      var index = 0;
      for(index = 0; index < langs_for_display.length; index++) {
            $("#"+langs_for_display[index]).text(0);
      }
      $("#ot").text(0);

  }

//Track terms GUI
$("#sortable").sortable();
$("#sortable").disableSelection();

countTodos();

// all done btn
$("#checkAll").click(function(){
AllDone();
});

//create todo
$('.add-todo').on('keypress',function (e) {

  e.preventDefault
  if (e.which == 13) {
       if($(this).val() != ''){
         var todo = $(this).val();
         createTodo(todo);
         countTodos();
       }else{
           // some validation
       }
  }
});


//delete done task from "already done"
$('.todolist').on('click','.remove-item',function(){
removeItem(this);
//alert("Untrack: "+$(this).parent().text());
var text = $(this).parent().text();
delete keywordMap[text];
keywordMapSize--;
socket.emit("untrack", text);
});


// count tasks
function countTodos(){
var count = $("#sortable li").length;
$('.count-todos').html(count);
}

//create task
function createTodo(text){
  if(startTimerCustomTrackFlag == 0){
    clock.setTime(0); //FilpClock comment
    clock.start(); //FilpClock comment
    //clearTimer();
    //startTimer();
    startTimerCustomTrackFlag=1;
  }
  //var markup = '<li class="ui-state-default"><div class="checkbox"><label><input type="checkbox" value="" />'+ text +'</label></div></li>';
  //var markup = '<li class="ui-state-default"><div class="checkbox">'+ text +'<button class="btn btn-default btn-xs pull-right  remove-item"><span class="glyphicon glyphicon-remove"></span></button></div></li>';
  keywordMap[text] = 1;
  keywordMapSize++;

  var markup = '<li>'+ text +'<button class="btn btn-default btn-xs pull-right  remove-item"><span class="glyphicon glyphicon-remove"></span></button></li>';
  $('#sortable').prepend(markup);
  $('.add-todo').val('');
  socket.emit("track", text);
}


function removeAllTask(){
  $('#sortable li').remove();
}

//mark all tasks as done
function AllDone(){
var myArray = [];

$('#sortable li').each( function() {
  myArray.push($(this).text());
});

// add to done
for (i = 0; i < myArray.length; i++) {
$('#done-items').append('<li>' + myArray[i] + '<button class="btn btn-default btn-xs pull-right  remove-item"><span class="glyphicon glyphicon-remove"></span></button></li>');
}

// myArray
$('#sortable li').remove();
countTodos();
}

//remove done task from list
function removeItem(element){
$(element).parent().remove();
}

//Google MAP code
var sub_id = Math.floor((Math.random() * 9999999999)+1);
var markers = [];
var markerCount = 0;
var map;
function initialize() {
var myLatlng = new google.maps.LatLng(20, -10);
var mapOptions = {
zoom: 3,
center: myLatlng,
mapTypeId: google.maps.MapTypeId.ROADMAP
}

map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
/*
var marker = new google.maps.Marker({
  position: myLatlng,
  map: map,
  title: 'Hello World!'
  });
*/
}

google.maps.event.addDomListener(window, 'load', initialize);

//This function will add a marker to the map each time it
//is called.  It takes latitude, longitude, and html markup
//for the content you want to appear in the info window
//for the marker.
function addMarkerToMap(latitude, longitude, text, img_url, name, screen_name, location){
  var infowindow = new google.maps.InfoWindow();
  var myLatLng = new google.maps.LatLng(latitude, longitude);
  var marker = new google.maps.Marker({
      position: myLatLng,
      map: map,
      animation: google.maps.Animation.DROP,
  });

  //Gives each marker an Id for the on click
  markers.push(marker);
  markerCount++;
  // google.maps.event.addListener(marker, "click", function() {
  //	marker.setMap(map);
// });
var m=0;
  //Creates the event listener for clicking the marker
  //and places the marker on the map
   google.maps.event.addListener(marker, 'mouseover', (function(marker, markerCount) {
       return function() {
          var htmlContent = '<div id=ele'+ m +' style="text-align: left; margin: 25px 0px; padding:1px; height:4em; background:pink;"><div style="float: left; margin: 0px 10px 3px 0px;"><img src='+img_url+' height=55 width=55></img></div><span><b>'+name+'</b>'+' @'+screen_name+'</br>'+text+'</span></div>';
          m++;
           infowindow.setContent(htmlContent);
           infowindow.open(map, marker);

       }
   })(marker, markerCount));

   google.maps.event.addListener(marker, 'mouseout', (function(marker, markerCount) {
       return function() {
           infowindow.close();

       }
   })(marker, markerCount));

  //Pans map to the new location of the marker
  //map.panTo(myLatLng)
}

function DeleteMarkers() {
  //Loop through all the markers and remove
  for (var k = 0; k < markers.length; k++) {
      markers[k].setMap(null);
  }
  markers = [];
};



//setTimeout(
function keepadd(text, img_url, name, screen_name, location)
{
  img_url = "/static/images/default_pink.png";
  if(indexAdd == 0)
  {
    if(location!=='' && location!==null)
        $('#main').prepend('<div class="well" id=ele'+indexAdd+' style="text-align: left; margin: 25px 0px; padding:1px; height:4em;"><div style="float: left; margin: 0px 10px 3px 0px;"><img src='+img_url+' height=55 width=55></img></div><span><b>'+name+'</b>'+' @'+screen_name+ '  '+ '<img src="/static/images/location2.png" height="auto" width="auto"></img>' +'<font color="#0099CC"> '+ location +'</font>'+'</br>'+text+'</span></div>');
    else
      $('#main').prepend('<div class="well" id=ele'+indexAdd+' style="text-align: left; margin: 25px 0px; padding:1px; height:4em;"><div style="float: left; margin: 0px 10px 3px 0px;"><img src='+img_url+' height=55 width=55></img></div><span><b>'+name+'</b>'+' @'+screen_name+ '  '+ '<img src="/static/images/location2.png" height="auto" width="auto"></img>' +'<font color="#FF6600"> Not available </font>'+'</br>'+text+'</span></div>');
  }else{
    if(location!=='' && location!==null)
      $('#main').prepend('<div class="well" id=ele'+indexAdd+' style="text-align: left; margin: 25px 0px; padding:1px; height:4em;"><div style="float: left; margin: 0px 10px 3px 0px;"><img src='+img_url+' height=55 width=55></img></div><span><b>'+name+'</b>'+' @'+screen_name+ '  '+ '<img src="/static/images/location2.png" height="auto" width="auto"></img>' +'<font color="#0099CC"> '+ location +'</font>'+'</br>'+text+'</span></div>');
    else
      $('#main').prepend('<div class="well" id=ele'+indexAdd+' style="text-align: left; margin: 25px 0px; padding:1px; height:4em;"><div style="float: left; margin: 0px 10px 3px 0px;"><img src='+img_url+' height=55 width=55></img></div><span><b>'+name+'</b>'+' @'+screen_name+ '  '+ '<img src="/static/images/location2.png" height="auto" width="auto"></img>' +'<font color="#FF6600"> Not available </font>'+'</br>'+text+'</span></div>');

    if(indexAdd >7)
    {
      var name="ele"+indexRemove;
      indexRemove++;
      var remele=document.getElementById(name);
      main.removeChild(remele);
    }
  }
  indexAdd++;
//have a counter i - append i with name of element as ele1 or ele2. Remove ele+i when j exceeds 8
}


function keepaddNeg(text, img_url, name, screen_name, location)
{
    if(indexAddNeg == 0)
    {
      if(location!=='' && location!==null)
          $('#mainNeg').prepend('<div class="well" id=eleNeg'+indexAddNeg+' style="text-align: left; margin: 25px 0px; padding:1px; height:4em;"><div style="float: left; margin: 0px 10px 3px 0px;"><img src='+img_url+' height=55 width=55></img></div><span><b>'+name+'</b>'+' @'+screen_name+ '  '+ '<img src="/static/images/location2.png" height="auto" width="auto"></img>' +'<font color="#0099CC"> '+ location +'</font>'+'</br>'+text+'</span></div>');
      else
        $('#mainNeg').prepend('<div class="well" id=eleNeg'+indexAddNeg+' style="text-align: left; margin: 25px 0px; padding:1px; height:4em;"><div style="float: left; margin: 0px 10px 3px 0px;"><img src='+img_url+' height=55 width=55></img></div><span><b>'+name+'</b>'+' @'+screen_name+ '  '+ '<img src="/static/images/location2.png" height="auto" width="auto"></img>' +'<font color="#FF6600"> Not available </font>'+'</br>'+text+'</span></div>');
    }else{
      if(location!=='' && location!==null)
        $('#mainNeg').prepend('<div class="well" id=eleNeg'+indexAddNeg+' style="text-align: left; margin: 25px 0px; padding:1px; height:4em;"><div style="float: left; margin: 0px 10px 3px 0px;"><img src='+img_url+' height=55 width=55></img></div><span><b>'+name+'</b>'+' @'+screen_name+ '  '+ '<img src="/static/images/location2.png" height="auto" width="auto"></img>' +'<font color="#0099CC"> '+ location +'</font>'+'</br>'+text+'</span></div>');
      else
        $('#mainNeg').prepend('<div class="well" id=eleNeg'+indexAddNeg+' style="text-align: left; margin: 25px 0px; padding:1px; height:4em;"><div style="float: left; margin: 0px 10px 3px 0px;"><img src='+img_url+' height=55 width=55></img></div><span><b>'+name+'</b>'+' @'+screen_name+ '  '+ '<img src="/static/images/location2.png" height="auto" width="auto"></img>' +'<font color="#FF6600"> Not available </font>'+'</br>'+text+'</span></div>');
      if(indexAddNeg >7)
      {
        var name="eleNeg"+indexRemoveNeg;
        indexRemoveNeg++;
        var remele=document.getElementById(name);
        mainNeg.removeChild(remele);
      }
    }
    indexAddNeg++;
}

function keepaddPos(text, img_url, name, screen_name, location)
{
    if(indexAddPos == 0)
    {
      if(location!=='' && location!==null)
          $('#mainPos').prepend('<div class="well" id=elePos'+indexAddPos+' style="text-align: left; margin: 25px 0px; padding:1px; height:4em;"><div style="float: left; margin: 0px 10px 3px 0px;"><img src='+img_url+' height=55 width=55></img></div><span><b>'+name+'</b>'+' @'+screen_name+ '  '+ '<img src="/static/images/location2.png" height="auto" width="auto"></img>' +'<font color="#0099CC"> '+ location +'</font>'+'</br>'+text+'</span></div>');
      else
        $('#mainPos').prepend('<div class="well" id=elePos'+indexAddPos+' style="text-align: left; margin: 25px 0px; padding:1px; height:4em;"><div style="float: left; margin: 0px 10px 3px 0px;"><img src='+img_url+' height=55 width=55></img></div><span><b>'+name+'</b>'+' @'+screen_name+ '  '+ '<img src="/static/images/location2.png" height="auto" width="auto"></img>' +'<font color="#FF6600"> Not available </font>'+'</br>'+text+'</span></div>');
    }else{
      if(location!=='' && location!==null)
        $('#mainPos').prepend('<div class="well" id=elePos'+indexAddPos+' style="text-align: left; margin: 25px 0px; padding:1px; height:4em;"><div style="float: left; margin: 0px 10px 3px 0px;"><img src='+img_url+' height=55 width=55></img></div><span><b>'+name+'</b>'+' @'+screen_name+ '  '+ '<img src="/static/images/location2.png" height="auto" width="auto"></img>' +'<font color="#0099CC"> '+ location +'</font>'+'</br>'+text+'</span></div>');
      else
        $('#mainPos').prepend('<div class="well" id=elePos'+indexAddPos+' style="text-align: left; margin: 25px 0px; padding:1px; height:4em;"><div style="float: left; margin: 0px 10px 3px 0px;"><img src='+img_url+' height=55 width=55></img></div><span><b>'+name+'</b>'+' @'+screen_name+ '  '+ '<img src="/static/images/location2.png" height="auto" width="auto"></img>' +'<font color="#FF6600"> Not available </font>'+'</br>'+text+'</span></div>');
      if(indexAddPos >7)
      {
        var name="elePos"+indexRemovePos;
        indexRemovePos++;
        var remele=document.getElementById(name);
        mainPos.removeChild(remele);
      }
    }
    indexAddPos++;
}

function keepaddNeutral(text, img_url, name, screen_name, location)
{
    if(indexAddNeutral == 0)
    {
      if(location!=='' && location!==null)
          $('#mainNeutral').prepend('<div class="well" id=eleNeutral'+indexAddNeutral+' style="text-align: left; margin: 25px 0px; padding:1px; height:4em;"><div style="float: left; margin: 0px 10px 3px 0px;"><img src='+img_url+' height=55 width=55></img></div><span><b>'+name+'</b>'+' @'+screen_name+ '  '+ '<img src="/static/images/location2.png" height="auto" width="auto"></img>' +'<font color="#0099CC"> '+ location +'</font>'+'</br>'+text+'</span></div>');
      else
        $('#mainNeutral').prepend('<div class="well" id=eleNeutral'+indexAddNeutral+' style="text-align: left; margin: 25px 0px; padding:1px; height:4em;"><div style="float: left; margin: 0px 10px 3px 0px;"><img src='+img_url+' height=55 width=55></img></div><span><b>'+name+'</b>'+' @'+screen_name+ '  '+ '<img src="/static/images/location2.png" height="auto" width="auto"></img>' +'<font color="#FF6600"> Not available </font>'+'</br>'+text+'</span></div>');
    }else{
      if(location!=='' && location!==null)
        $('#mainNeutral').prepend('<div class="well" id=eleNeutral'+indexAddNeutral+' style="text-align: left; margin: 25px 0px; padding:1px; height:4em;"><div style="float: left; margin: 0px 10px 3px 0px;"><img src='+img_url+' height=55 width=55></img></div><span><b>'+name+'</b>'+' @'+screen_name+ '  '+ '<img src="/static/images/location2.png" height="auto" width="auto"></img>' +'<font color="#0099CC"> '+ location +'</font>'+'</br>'+text+'</span></div>');
      else
        $('#mainNeutral').prepend('<div class="well" id=eleNeutral'+indexAddNeutral+' style="text-align: left; margin: 25px 0px; padding:1px; height:4em;"><div style="float: left; margin: 0px 10px 3px 0px;"><img src='+img_url+' height=55 width=55></img></div><span><b>'+name+'</b>'+' @'+screen_name+ '  '+ '<img src="/static/images/location2.png" height="auto" width="auto"></img>' +'<font color="#FF6600"> Not available </font>'+'</br>'+text+'</span></div>');
      if(indexAddNeutral >7)
      {
        var name="eleNeutral"+indexRemoveNeutral;
        indexRemoveNeutral++;
        var remele=document.getElementById(name);
        mainNeutral.removeChild(remele);
      }
    }
    indexAddNeutral++;
}

function drawKeywordBubbles(jsonString){
var jsonObject = JSON.parse(jsonString);
var width = 0.8*$("#wordcloud").width();
var diameter = width,
    format = d3.format(",d"),
    color = d3.scale.category20c();

var bubble = d3.layout.pack()
    .sort(null)
    .size([diameter, diameter])
    .padding(1.5);

d3.select("#wordcloud").selectAll("svg").remove();
var svg = d3.select("#wordcloud").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .attr("class", "bubble");

  var node = svg.selectAll(".node")
      .data(bubble.nodes(classes(jsonObject))
      .filter(function(d) { return !d.children; }))
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

  node.append("title")
      .text(function(d) { return d.className + ": " + format(d.value); });

  node.append("circle")
      .attr("r", function(d) { return d.r; })
      .style("fill", function(d) { return colores_google(d.packageName); });

  node.append("text")
      .attr("dy", ".3em")
      .style("text-anchor", "middle")
      .style("font-size", function(d) {
        var len = (d.className + " (" + format(d.value)+")").substring(0, d.r / 3).length;
        var size = d.r/3;
        size *= 10 / len;
        size += 1;
        return Math.round(size)+'px';
      })
      .text(function(d) { return (d.className + " (" + format(d.value)+")").substring(0, d.r / 3); });
//  });

// Returns a flattened hierarchy containing all leaf nodes under the root.
function classes(root) {
  var classes = [];

  function recurse(name, node) {
    if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
    else classes.push({packageName: node.color, className: node.name, value: node.size});
  }

  recurse(null, root);
  return {children: classes};
}

d3.select(self.frameElement).style("height", diameter + "px");
}

function colores_google(n) {
  var colores_g = ["#3276B1", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
  return colores_g[n % colores_g.length];
}

function drawHashTagBubbles(jsonString){
var jsonObject = JSON.parse(jsonString);

var width = 0.8*$("#hashtag_wordcloud").width();
var diameter = width,
    format = d3.format(",d"),
    color = d3.scale.category20c();

var bubble = d3.layout.pack()
    .sort(null)
    .size([diameter, diameter])
    .padding(1.5);

d3.select("#hashtag_wordcloud").selectAll("svg").remove();
var svg = d3.select("#hashtag_wordcloud").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .attr("class", "bubble");

//d3.json("http://10.6.9.32/flare"+i_d3+".json", function(error, root) {
//  i_d3++;

  var node = svg.selectAll(".node")
      .data(bubble.nodes(classes(jsonObject))
      .filter(function(d) { return !d.children; }))
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

  node.append("title")
      .text(function(d) { return d.className + ": " + format(d.value); });

  node.append("circle")
      .attr("r", function(d) { return d.r; })
      .style("fill", function(d) { return colores_google(3); });

  node.append("text")
      .attr("dy", ".3em")
      .style("text-anchor", "middle")
      .style("font-size", function(d) {
        var len = (d.className + " (" + format(d.value)+")").substring(0, d.r / 3).length;
        var size = d.r/3;
        size *= 10 / len;
        size += 1;
        return Math.round(size)+'px';
      })
      .text(function(d) { return (d.className + " (" + format(d.value)+")").substring(0, d.r / 3); });
//  });

// Returns a flattened hierarchy containing all leaf nodes under the root.
function classes(root) {
  var classes = [];

  function recurse(name, node) {
    if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
    else classes.push({packageName: node.color, className: node.name, value: node.size});
  }

  recurse(null, root);
  return {children: classes};
}

d3.select(self.frameElement).style("height", diameter + "px");

//setTimeout(drawBubbles, 2000);
}

//TopK people with max followers
function update_list_topK_user_with_max_followers(jsonString){
  var jsonObject = JSON.parse(jsonString);
  var obj = jQuery.parseJSON(jsonString);
  var total = obj.length;
  //console.log("Total: "+total);
  if( $('ul#max_followers_ul > li').length >=1 )
    $("#max_followers_ul").empty();

  //$("#top_k_users").append('<div><label for="max_followers_ul">Most influential people:</label></div>');
  for(var i=0; i<total; i++){
    var profile_image_url_https = obj[i].profile_image_url_https+"#"+Math.random();
    var user_account_url = "https://twitter.com/"+obj[i].screen_name;

    if($("#max_followers_img_"+i).length){
        $("#max_followers_img_"+i).removeAttr("src").attr('src', profile_image_url_https);
        $("#max_followers_a_"+i).attr('href', user_account_url);
    }else{
        var element = '<li class="img-li"><a id="max_followers_a_'+i+'" href="'+user_account_url+'" class="img-thumbnail img-responsive img-rounded" target="_blank"><img id="max_followers_img_'+i+'" src="'+profile_image_url_https+'" alt="50x50"></a></li>';
        $("#max_followers_ul").append(element);
        //$("#img_ul_1").show();
    }

  }
}

//Top K users with max tweets
function update_list_topK_user_with_max_tweets(jsonString){
  var jsonObject = JSON.parse(jsonString);
  var obj = jQuery.parseJSON(jsonString);
  var total = obj.length;
  //console.log("Total: "+total);
  //$("#top_k_users").append('<div><label for="max_tweets_ul">Most active people:</label></div>');
  if( $('ul#max_tweets_ul > li').length >=1 )
    $("#max_tweets_ul").empty();

  for(var i=0; i<total; i++){

    var profile_image_url_https = obj[i].profile_image_url_https+"#"+Math.random();
    var user_account_url = "https://twitter.com/"+obj[i].screen_name;
    if($("#max_tweets_img_"+i).length){
        $("#max_tweets_img_"+i).removeAttr("src").attr('src', profile_image_url_https);
        $("#max_tweets_a_"+i).attr('href', user_account_url);
    }else{
        var element = '<li class="img-li"><a id="max_tweets_a_'+i+'" href="'+user_account_url+'" class="img-thumbnail img-responsive img-rounded" target="_blank"><img id="max_tweets_img_'+i+'" src="'+profile_image_url_https+'" alt="125x125"></a></li>';
        $("#max_tweets_ul").append(element);
    }
  }
}


//Top K users with max mentions
function update_list_topK_most_mentioned_users(jsonString){
  var jsonObject = JSON.parse(jsonString);
  var obj = jQuery.parseJSON(jsonString);
  var total = obj.length;
  //console.log("Total: "+total);
  //$("#top_k_users").append('<div><label for="max_tweets_ul">Most active people:</label></div>');
  if( $('ul#most_mentioned_ul > li').length >=1 )
    $("#most_mentioned_ul").empty();

  for(var i=0; i<total; i++){
    var profile_image_url_https = "https://twitter.com/"+obj[i].name+"/profile_image?size=normal"+"#"+Math.random();
    var user_account_url = "https://twitter.com/"+obj[i].name;

    if($("#most_mentioned_img_"+i).length){
        $("#most_mentioned_img_"+i).removeAttr("src").attr('src', profile_image_url_https);
        $("#most_mentioned_a_"+i).attr('href', user_account_url);
    }else{
        var element = '<li class="img-li"><a id="most_mentioned_a_'+i+'" href="'+user_account_url+'" class="img-thumbnail img-responsive img-rounded" target="_blank"><img id="most_mentioned_img_'+i+'" src="'+profile_image_url_https+'" alt="125x125"></a></li>';
        $("#most_mentioned_ul").append(element);
    }
  }
}

//Top K max retweets
function update_list_topK_max_retweets(jsonString){
  var jsonObject = JSON.parse(jsonString);
  var obj = jQuery.parseJSON(jsonString);
  var total = obj.length;

  //console.log("Total: "+total);
  //$("#top_k_users").append('<div><label for="max_tweets_ul">Most active people:</label></div>');
  if( $('div#retweets_window > div').length >=1 ){
    $("#retweets_window").empty();
    //console.log("Clearing window!");
  }

  for(var i=0; i<total; i++){

    var tweet_id = obj[i].tweet_id;
    var retweet_id = obj[i].retweet_id;
    var retweet_user_name = obj[i].retweet_user_name;
    var retweet_user_screen_name = obj[i].retweet_user_screen_name;
    var retweet_text = obj[i].retweet_text;
    var retweet_user_profile_image_url_https = obj[i].retweet_user_profile_image_url_https+"#"+Math.random();
    var retweet_count = obj[i].retweet_count;
    var original_tweet_user_account_url = "https://twitter.com/"+retweet_user_screen_name;
    var retweet_user_location = obj[i].retweet_user_location;
      var newEle;
      var tweet_id_m = tweet_id.replace("TID: ", "");
      //var retweetBtn = '<a href="https://twitter.com/intent/tweet?text='+escape(retweet_text)+'"&via="TwitterPlay" class="twitter-share-button" >Retweet</a>';
      var retweetBtn = '<a href="https://twitter.com/intent/tweet?text='+escape(retweet_text)+'" class="retweet" style="display:inline-block;font-family:georgia,serif;font-size:12px;color:#000;text-decoration:none;padding:1px 5px;border:1px solid #ccc;border-radius:3px;background-color:#ddd;background:linear-gradient(to bottom, #f6f6f6, #ddd)">Retweet</a>';

      if(retweet_user_location!=='' && retweet_user_location!==null){
          newEle = '<div class="well" id=ele_retweet'+i+' style="text-align: left; margin: 25px 0px; padding:1px; height:4em;"><div style="float: left; margin: 0px 10px 3px 0px;"><a id="max_tweets_a_'+i+'" href="'+original_tweet_user_account_url+'" class="img-thumbnail img-responsive img-rounded" target="_blank"><img src='+retweet_user_profile_image_url_https+' height=55 width=55></img></a></div><span><b>'+retweet_user_name+'</b>'+' @'+retweet_user_screen_name+ '  '+', Retweet count: <b>'+retweet_count+'</b>  '+ '<img src="/static/images/location2.png" height="auto" width="auto"></img>' +'<font color="#FF6600"> '+ retweet_user_location +' </font> '+retweetBtn+'</br>'+retweet_text+'</span></div>';
      }else{
          newEle = '<div class="well" id=ele_retweet'+i+' style="text-align: left; margin: 25px 0px; padding:1px; height:4em;"><div style="float: left; margin: 0px 10px 3px 0px;"><a id="max_tweets_a_'+i+'" href="'+original_tweet_user_account_url+'" class="img-thumbnail img-responsive img-rounded" target="_blank"><img src='+retweet_user_profile_image_url_https+' height=55 width=55></img></a></div><span><b>'+retweet_user_name+'</b>'+' @'+retweet_user_screen_name+ '  '+', Retweet count: <b>'+retweet_count+'</b>  '+ '<img src="/static/images/location2.png" height="auto" width="auto"></img>' +'<font color="#FF6600"> Not available </font> '+retweetBtn+'</br>'+retweet_text+'</span></div>';
      }
      $("#retweets_window").append(newEle);
  }
}

function update_list_topK_insta_photos(jsonString){
  var jsonObject = JSON.parse(jsonString);
  var obj = jQuery.parseJSON(jsonString);
  var total = obj.length;

  //console.log("Total: "+total);
  //$("#top_k_users").append('<div><label for="max_tweets_ul">Most active people:</label></div>');
  if( $('div#insta_photos_window > div').length >=1 )
    $("#insta_photos_window").empty();

  for(var i=0; i<total; i++){

    var img_url = obj[i].img_url;
    var profile_link = obj[i].profile_link;
    var likes_count = obj[i].likes_count;
    var comments_count = obj[i].comments_count;

    var newEle = '<div class="instagram-pic col-sm-3"><a href="'+profile_link+'" target="_blank"><img src="'+img_url+'" class="img-responsive"></a><div class="instagram-bar"> <div class="likes"><span class="glyphicon glyphicon-heart"></span>'+likes_count+'</div><div class="comments"><span class="glyphicon glyphicon-comment"></span>'+comments_count+'</div></div></div>';
    $("#insta_photos_window").append(newEle);
  }
}

function update_google_trend(jsonString){
  if(jsonString != "Empty"){
    var jsonObject = JSON.parse(jsonString);
    var obj = jQuery.parseJSON(jsonString);
    var total = obj.length;
    var str="";
    var i=0;
    for(; i<total; i++){
      str += obj[i].keyword.replace(/\#/g, '%23')+",";
    }
    var url = "https://www.google.com/trends/fetchComponent?hl=en-US&q="+str+"&cmpt=q&content=1&cid=TIMESERIES_GRAPH_0&export=5&w=640&h=330";
    $("#google_iframe").attr('src', url);
  }else{
    var url = "";
    $("#google_iframe").attr('src', url);
  }
}

$(function() {
  $('#instagramFunction').change(function() {
    if(instagramFunction===0){
      instagramFunction=1;
    }
    else {
      instagramFunction=0;
      $("#insta_photos_window").empty();
    }
  })
})

$(function() {
  $('#sentimentClassificationFunction').change(function() {
    if(sentimentClassificationFunction===0){
      socket.emit("turnOnSentiClass", "No data!");
      $('#posNegTweetsClassRow').show();
      $('#neutralTweetsClassRow').show();
      sentimentClassificationFunction=1;
    }
    else {
      sentimentClassificationFunction=0;
      socket.emit("turnOffSentiClass", "No data!");
      $("#mainPos").empty();
      $("#mainNeg").empty();
      $("#mainNeutral").empty();
      $('#posNegTweetsClassRow').hide();
      $('#neutralTweetsClassRow').hide();
    }
  })
})


function timerClock() {
  var hour, min, sec, str, count;
  time++;
  sec = time % 60;
  min = (time - sec) / 60 % 60;
  hour = (time - sec - (min * 60)) / 3600;
  count = hour + ':' + ('0' + min).slice(-2) + ':' + ('0' + sec).slice(-2);
  $('.responseTime').text(count);
  setTimeout(timerClock, timerClockDelay);
}

function stopTimer(){
  timerClockDelay = 99999999999;
}

function startTimer(){
  timerClockDelay = 1000;
  time = 0;
  timerClock();
}

function restartTimer(){
  startTimer();
}

function clearTimer(){
  stopTimer();
  $('.responseTime').text("0:00:00");
  time = 0;
}
