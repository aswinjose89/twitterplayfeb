let node_machine = appSettings['appConfig']['node_machine'];
let protocol = appSettings['appConfig']['protocol'];
var socket = io.connect(protocol + '://'+ node_machine +'/process_live_tweets',{
      "path": '/process_live_tweets',
      "force new connection" : true,
      "reconnection": true,
      "reconnectionDelay": 2000,                  //starts with 2 secs delay, then 4, 6, 8, until 60 where it stays forever until it reconnects
      "reconnectionDelayMax" : 60000,             //1 minute maximum delay between connections
      "reconnectionAttempts": "Infinity",         //to prevent dead clients, having the user to having to manually reconnect after a server restart.
      "timeout" : 10000,                           //before connect_error and connect_timeout are emitted.
      "autoConnect": true
});
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
var allLiveTweetsArr = [];
var allTweetElements = [];
var tweets_classifications= (sessionStorage.mongoFieldData)? JSON.parse(sessionStorage.mongoFieldData).tweets_classifications: null;
var hastag_cloud_tweets = null
var keywords_cloud_tweets = null;

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
var gpscount = 0;
var locationcount = 0;
var startTimerCustomTrackFlag = 0;
var clock = new FlipClock($('#timer_clock'), {
    autoStart: false
});

var prompting = false;
var password_enabled = false;
var password = PASSWORD_TRIAL_VERSION;

var displayGlobalFlag = 0;

clock.autoStart = false;
  $("#loading-indicator").show();
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

// $("#btn_all_hashtag").click(function(){
//     var thisButton = this;
//     if(cnfPopupFlg){
//         bootbox.confirm("This operation will clear the current screen. Do you still want to continue?", function(result) {
//             if(result==true){

//                 trackingAllHashtags = true;
//                 trackingAllKeywords = false;
//                 trackingCustomKeywords = false;

//                 clearAll();
//                 socket.emit("trackallhashtags", "No Data!");
//                 Example.show("Tracking started for all hashtag");
//                 $("#inputkeyword").attr("disabled", true);
//                 $(".btn-group-vertical > .btn").removeClass("active");
//                 $(thisButton).addClass("active");
//                 clock.setTime(0); //FilpClock comment
//                 clock.start(); //FilpClock comment
//                 //clearTimer();
//                 //startTimer();
//             }
//         });
//     }else{
//         trackingAllHashtags = true;
//         trackingAllKeywords = false;
//         trackingCustomKeywords = false;
//         socket.emit("trackallhashtags", "No Data!");
//         Example.show("Tracking started for all hashtag");
//         $("#inputkeyword").attr("disabled", true);
//         $(".btn-group-vertical > .btn").removeClass("active");
//         $(thisButton).addClass("active");
//         clock.setTime(0); //FilpClock comment
//         clock.start(); //FilpClock comment
//         //clearTimer();
//         //startTimer();
//     }
//     cnfPopupFlg=1;

// });

// $("#btn_all_keyword").click(function(){
//     var thisButton = this;
//     if(cnfPopupFlg){
//         bootbox.confirm("This operation will clear the current screen. Do you still want to continue?", function(result) {
//             if(result==true){
//                 clearAll();
//                 trackingAllHashtags = false;
//                 trackingAllKeywords = true;
//                 trackingCustomKeywords = false;
//                 socket.emit("trackallkeywords", "No Data!");
//                 Example.show("Tracking started for all keywords");
//                 $("#inputkeyword").attr("disabled", true);
//                 $(".btn-group-vertical > .btn").removeClass("active");
//                 $(thisButton).addClass("active");
//                 clock.setTime(0); //FilpClock comment
//                 clock.start(); //FilpClock comment
//                 //clearTimer();
//                 //startTimer();
//             }
//         });
//     }else{
//         trackingAllHashtags = false;
//         trackingAllKeywords = true;
//         trackingCustomKeywords = false;

//         socket.emit("trackallkeywords", "No Data!");
//         Example.show("Tracking started for all keywords");
//         $("#inputkeyword").attr("disabled", true);
//         $(".btn-group-vertical > .btn").removeClass("active");
//         $(thisButton).addClass("active");
//         clock.setTime(0); //FilpClock comment
//         clock.start(); //FilpClock comment
//         //clearTimer();
//         //startTimer();
//     }
//     cnfPopupFlg=1;
// });

// $("#btn_custom_keyword").click(function(){
//     var thisButton = this;
//     if(cnfPopupFlg){
//         bootbox.confirm("This operation will clear the current screen. Do you still want to continue?", function(result) {
//             if(result==true){
//                 trackingAllHashtags = false;
//                 trackingAllKeywords = false;
//                 trackingCustomKeywords = true;

//                 clearAll();
//                 Example.show("Enter hashtag or keyword in the textbox provided");
//                 $("#inputkeyword").attr("disabled", false);
//                 $(".btn-group-vertical > .btn").removeClass("active");
//                 $(thisButton).addClass("active");

//             }
//         });
//     }else{
//         trackingAllHashtags = false;
//         trackingAllKeywords = false;
//         trackingCustomKeywords = true;

//         Example.show("Enter hashtag or keyword in the textbox provided");
//         $("#inputkeyword").attr("disabled", false);
//         $(".btn-group-vertical > .btn").removeClass("active");
//         $(thisButton).addClass("active");
//     }
//     cnfPopupFlg=1;

// });

socket.on('takeTweet', function(msg, keywordMap){
    //$('#messages').prepend($('<li>').text(msg.text));
    $("#loading-indicator").hide();
    if(tweetsCount == 0){
        startTime =  new Date().getTime();
    }

    if(msg.coordinates!=null || msg.place != null){
        var actualCoordinates = null;
        if(msg.coordinates != null && msg.coordinates != "" && msg.coordinates != undefined) {
            actualCoordinates = msg.coordinates.coordinates;
            gpscount++;
        } else if( msg.place != null && msg.place != "" && msg.place != undefined) {
            actualCoordinates = msg.place.bounding_box.coordinates[0][0];
            gpscount++;
        }
        $("#gpscount").text(gpscount);
        // addMarkerToMap(actualCoordinates[1], actualCoordinates[0] , msg.text, msg.user.profile_image_url_https, msg.user.name, msg.user.screen_name, msg.user.location);
    }
    let full_text = mixin.get_tweet_text(msg)
    keepadd(full_text, msg.profile_image_url_https, msg.name, msg.screen_name, msg.location, keywordMap, msg);
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




// function getTopKeywordsFileAtMaxLimit(){
//     $("#download").text("");
//     $("#loading-indicator").show();
//     socket.emit("getTopKeywordsFile", "SaveAll!");
// }

// function getTweetsFileAtMaxLimit(){
//     $("#download").text("");
//     $("#loading-indicator").show();
//     socket.emit("getAllTweetsFile", "SaveAll!");
//     Example.show("saving All tweets please wait.... total tweets   : " + tweetsCount);
//     console.log("saving All tweets  user file   "+ tweetsCount + " maxcounter = "+maxcounter);
// }

// function getMaxReTweetsFileAtMaxLimit(){
//     $("#download").text("");
//     $("#loading-indicator").show();
//     socket.emit("getTopKMaxReTweetsFile", "SaveAll!");
//     console.log("saving Retweet max  user file   "+ tweetsCount + " maxcounter = "+maxcounter);
// }

// function getTopKMostInfluentialUsersFileAtMaxLimit(){
//     $("#download").text("");
//     $("#loading-indicator").show();
//     socket.emit("getTopKMostInfluentialUsersFile", "SaveAll!");
//     console.log("saving Most influential user file   "+ tweetsCount + " maxcounter = "+maxcounter);
// }

// function getTopKMostActiveUsersFileAtMaxLimit(){
//     $("#download").text("");
//     $("#loading-indicator").show();
//     socket.emit("getTopKMostActiveUsersFile", "SaveAll!");
//     console.log("saving Active user file   "+ tweetsCount + " maxcounter = "+maxcounter);
// }
// function getAllRetweetFileAtMaxLimit(){
//     $("#download").text("");
//     $("#loading-indicator").show();
//     socket.emit("getFullReTweetsFile", "SaveAll!");
//     console.log("saving All Retweet files..    "+ tweetsCount + " maxcounter = "+maxcounter);
// }

// function getTopKMostInfluentialUsersFile(){
//     $("#download").text("");
//     $("#loading-indicator").show();
//     socket.emit("getTopKMostInfluentialUsersFile", "No Data!");
// }

// function getTopKMostActiveUsersFile(){
//     $("#download").text("");
//     $("#loading-indicator").show();
//     socket.emit("getTopKMostActiveUsersFile", "No Data!");
// }

// function getMaxReTweetsFile(){
//     $("#download").text("");
//     $("#loading-indicator").show();
//     socket.emit("getTopKMaxReTweetsFile", "No Data!");

// }

// function getPosTweetsFile(){
//     $("#download").text("");
//     $("#loading-indicator").show();
//     socket.emit("getPosTweetsFile", "No Data!");
// }

// function getNegTweetsFile(){
//     $("#download").text("");
//     $("#loading-indicator").show();
//     socket.emit("getNegTweetsFile", "No Data!");
// }

// function getNeutralTweetsFile(){
//     $("#download").text("");
//     $("#loading-indicator").show();
//     socket.emit("getNeutralTweetsFile", "No Data!");
// }

function displayThroughput(count){
    var duration =  new Date().getTime() - startTime;
    duration = duration/(1000*60);
    if(duration>0){
        $("#throughput").text(Math.floor(count/duration));
    }else{
        $("#throughput").text("NA");
    }
}




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


socket.on('takeFullRTFile', function(filename){
    //$("#download").attr("href", '/givemefile?name='+filename);
    if(filename != "NoFileExist"){
        changeViewFileDownload(filename);
        $("#download_retweets_excel").text("Update All unique retweeted tweets file");
    }else{
        $("#loading-indicator").hide();
    }
});

socket.on("displaycount", function(msg){
    Example.show("Total Keywords : " + msg  + "  Batch :  " + keywordMapSize);
});


function changeViewFileDownload(filename){
    $("#loading-indicator").hide();
    $("#download").text("\""+filename+"\" has been saved to the cloud.");
}

//socket.on("hightraffic", function(count){
//TwBufferLimitreached = "Y";
// bufferExceededTweetWrite();
//});

// socket.on('showhashtag', function(count){
//     $("#hashtagtweets").text(count);
// });

// socket.on('showmentioned', function(count){
//     $("#mentionedtweets").text(count);
// });

// socket.on('takeTopKKeywords', function(jsonString){
//     if(jsonString.length>35)
//         drawKeywordBubbles(jsonString);
// });


// socket.on("takeTopKMostInfluentialUsers", function(jsonString){

//     if(jsonString.length>15){ //100 is arbitrary choosen number.
//         update_list_topK_user_with_max_followers(jsonString);
//         delayTopKMostInfluentialUsers = FINAL_DELAY_TOP_K_MOST_INFLUENTIAL_USERS;
//     }
// });

// socket.on("takeTopKMostActiveUsers", function(jsonString){
//     if(jsonString.length>15){ //100 is arbitrary choosen number.
//         update_list_topK_user_with_max_tweets(jsonString);
//         delayTopKMostActiveUsers = FINAL_DELAY_TOP_K_MOST_ACTIVE_USERS;
//     }
// });

// socket.on("takeTopKMostMentionedUsers", function(jsonString){
//     if(jsonString.length>15){ //100 is arbitrary choosen number.
//         update_list_topK_most_mentioned_users(jsonString);
//         delayTopKMostMentionedUsers = FINAL_DELAY_TOP_K_MOST_MENTIONED_USERS;
//     }
// });

// socket.on("takeTopKMaxReTweets", function(jsonString, keywordMap){

//     if(jsonString.length>15){ //100 is arbitrary choosen number.
//         update_list_topK_max_retweets(jsonString, keywordMap);
//         delayTopKMaxReTweets = FINAL_DELAY_TOP_K_MAX_RETWEETS;
//     }
// });

// socket.on("takeTopKInstaPhotos", function(jsonString){
//     if(jsonString.length>15){ //100 is arbitrary choosen number.
//         if(instagramFunction == 1){
//             update_list_topK_insta_photos(jsonString);
//             delayTopKInstaPhotos = FINAL_DELAY_TOP_K_INSTA_PHOTOS;
//         }
//     }
// });

// socket.on("takeSentimentCount", function(jsonStr){
//     var jsonObj = JSON.parse(jsonStr);
//     $("#negSentCount").text(jsonObj["negSentCount"]);
//     $("#posSentCount").text(jsonObj["posSentCount"]);
//     $("#neutralSentCount").text(jsonObj["neutralSentCount"]);
//     $("#totalsenticount").text(jsonObj["totalsenticount"]);

// });


// socket.on("twitter_error", function(msg){
//     Example.show("TwitterAPI error,  auto reconnecting after 90 seconds :" + msg);
// });

// socket.on("apiwarning", function(warning){
//     Example.show("Twitter buffer full warning :" + warning.code  + "  " +warning.percent_full) ;
// });

// socket.on("limitwarning", function(limit){
//     Example.show("No.of undelivered tweets due to limit :" + limit.track);
// });

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



//Track terms GUI
//$("#sortable").sortable();
//$("#sortable").disableSelection();




//delete done task from "already done"
$('.todolist').on('click','.remove-item',function(){
    removeItem(this);
//alert("Untrack: "+$(this).parent().text());
    var text = $(this).parent().text();
    delete keywordMap[text];
    keywordMapSize--;
    socket.emit("untrack", text);
});

function removeKeywords(){
    let [_self, text] = arguments;
    removeItem(_self);
    //alert("Untrack: "+$(this).parent().text());
    // var text = $(this).parent().text();
    delete keywordMap[text];
    keywordMapSize--;
    socket.emit("untrack", text);

}

var custom_keys = localStorage.getItem('custom_keys')
if(custom_keys){
  socket.emit('track',custom_keys)
}

function removeAllTask(){
    $('#sortable li').remove();
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
        zoom: 2,
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

// google.maps.event.addDomListener(window, 'load', initialize);

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
var live_twts_selected_usrs = null;
socket.on('collect_all_users',function(data){
  $('#all_users').selectize({
        plugins: ['remove_button'],
        maxItems: null,
        valueField: 'id',
        labelField: 'displayName',
        searchField: 'displayName',
        options: data.map(x=>x.twitter),
        create: false,
        onChange: function(value) {
           live_twts_selected_usrs = value;
        }
  });
})



function subMenuToggle(element,e){
  mixin.subMenuDropDownToggle(element,e)
}


function live_twt_classification_binder(){
    var [tweets_classifications, tweet_obj_temp] = arguments;
    var strConcat = "";
    tweets_classifications.forEach((val)=>{
      strConcat=`<li><a tabindex="-1" href="#" onclick='tweetActions(this,"CLASSIFICATION", event, ${JSON.stringify(tweet_obj_temp)}, ${JSON.stringify(val)})'>${val.label}</a></li>`+ strConcat
    })
    return strConcat;
}
var role_map_twt_dtls = null;
function get_twts_dtl_from_role_mapping(tweet_obj){
  role_map_twt_dtls = tweet_obj;
}
function tweetActions(){
  var [self, flag, event, tweet_obj, classification] = arguments;

  var twts_act_obj = {
        actions: {},
        users: null
    }
   if(flag === 'ROL_MAP' && role_map_twt_dtls){
     twts_act_obj.tweet_id= role_map_twt_dtls.tweet_id
     twts_act_obj.tweet_id_str= role_map_twt_dtls.tweet_id_str
   }
   else{
     twts_act_obj.tweet_id= tweet_obj.tweet_id
     twts_act_obj.tweet_id_str= tweet_obj.tweet_id_str
   }
  switch (flag) {
    case 'IMP':
      twts_act_obj.actions.is_important = true;
      break;
    case 'CAT_IGN':
      twts_act_obj.actions.category = 'IGNORE';
      break;
    case 'CAT_FOL':
      twts_act_obj.actions.category = 'FOLLOWUP';
      break;
    case 'CAT_RES':
      twts_act_obj.actions.category = 'RESEARCH';
      break;
    case 'CLASSIFICATION':
     twts_act_obj.actions.classification = classification.field;
     break;
    case 'ROL_MAP':
      twts_act_obj.actions.users = live_twts_selected_usrs;
      break;
    default:
  }
  var selection = '<img src="https://img.icons8.com/color/48/000000/ok.png" style="width: 25px;float: right;">';
  $(self).append(selection);
  $(self).addClass('selected_dropdown_option');
  socket.emit('storeTwtsActions', twts_act_obj);

}
//setTimeout(
var icount=0
function keepadd(text, img_url, name, screen_name, location, custom_keywords, tweet_obj)
{
    if(location!=='' && location!==null){
        locationcount++;
        $('#locationcount').text(locationcount);
    }
    // img_url = "/static/images/default_pink.png";
    text = (typeof(custom_keywords))? mixin.tweetsHighlight(text, Object.keys(custom_keywords)):text;
    text = mixin.urlify(text)
    var speed = 10000; // 10000 = 10 seconds

    var tweet_id_str = tweet_obj.id_str;

    var tweet_obj_temp = {
      tweet_id: tweet_obj.id,
      tweet_id_str: tweet_obj.id_str,
      followers_count: tweet_obj.followers_count,
      friends_count: tweet_obj.friends_count,
      language: tweet_obj.lang,
      source: (tweet_obj.source)?$(tweet_obj.source).text().replace("Twitter","").replace("for","").trim(): tweet_obj.source,
      created_at: tweet_obj.created_at,
      profile_banner_url: tweet_obj.profile_banner_url,
      profile_image_url_https: tweet_obj.profile_image_url_https,
      statuses_count: tweet_obj.statuses_count
    };
    var tweets_cloud_url =`/tweets_cloud?profile_banner_url=${tweet_obj_temp.profile_banner_url}&screen_name=${screen_name}&followers_count=${tweet_obj_temp.followers_count}&friends_count=${tweet_obj_temp.friends_count}&location=${location}&statuses_count=${tweet_obj_temp.statuses_count}&name=${name}&language=${tweet_obj_temp.language}&profile_image_url_https=${tweet_obj_temp.profile_image_url_https}`;

    if(indexAdd == 0)
    {
        var tweet_card = `
                <div class="tweets-card well well-lg col-xs-12" id=ele${indexAdd}>
                    <div class="btn-group pull-right">
                        <button type="button" class="btn dropdown-toggle tweets-btn-menu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i class="ion-chevron-down"></i>
                        </button>
                        <ul class="dropdown-menu live_twt_dropdown">
                          <li><a href="#" onclick='tweetActions(this,"IMP",event, ${JSON.stringify(tweet_obj_temp)})'><img src="https://img.icons8.com/color/48/000000/box-important.png" style=" width: 25px;margin-right: 6px;float:left">Mark Important</a></li>
                          <li class="dropdown-submenu">
                            <a tabindex="-1" href="#" onclick="subMenuToggle(this, event)">Category</a>
                            <ul class="dropdown-menu live_twt_dropdown_submenu">
                              <li><a tabindex="-1" href="#" onclick='tweetActions(this,"CAT_IGN", event, ${JSON.stringify(tweet_obj_temp)})'>Ignore</a></li>
                              <li><a tabindex="-1" href="#" onclick='tweetActions(this,"CAT_FOL", event, ${JSON.stringify(tweet_obj_temp)})'>FollowUp</a></li>
                              <li><a tabindex="-1" href="#" onclick='tweetActions(this,"CAT_RES", event, ${JSON.stringify(tweet_obj_temp)})'>Research</a></li>
                            </ul>
                          </li>
                          <li class="dropdown-submenu">
                            <a tabindex="-1" href="#" onclick="subMenuToggle(this, event)">Classifications</a>
                            <ul class="dropdown-menu live_twt_dropdown_submenu">
                            ${live_twt_classification_binder(tweets_classifications, tweet_obj_temp)}
                            </ul>
                          </li>
                          <li role="separator" class="divider"></li>
                          <li><a href="#" data-toggle="modal" data-target="#role_mapping_modal" onclick='get_twts_dtl_from_role_mapping(${JSON.stringify(tweet_obj_temp)})'><img style="width: 30px; margin-right: 6px;float:left" src="https://img.icons8.com/bubbles/50/000000/groups.png">Assign to</a></li>
                        </ul>
                    </div>
                    <div style="float: left; width: 6%"><img src=${img_url} height=35 width=35></img>
                    </div><span style="width: 86%;color:#1565C0"><span style="font-weight: bold;">${name}</span> @<a href="${tweets_cloud_url}" target="_blank">${screen_name}</a>    <img src="/static/images/location2.png" height="auto" width="auto" style="margin-left:10px"></img><font color="#0099CC"> ${(location!=='' && location!==null)?location: 'Not available'}</font></br> <font color="#060606"> ${text}</span>

                    <div class="row pull-right" style="width:27%">
                      <script type="text/javascript" async="" src="https://platform.twitter.com/widgets.js"></script>
                      <div class="col-md-4" style="margin-top: 6px;">
                            <a class="btn-twitter" href="https://twitter.com/intent/tweet?in_reply_to=${tweet_id_str}"><i class="fa fa-twitter fa_logo fa-lg"></i> Reply</a>
                      </div>
                      <div class="col-md-4" style="margin-top: 6px;left: -7px;">
                            <a class="btn-twitter" href="https://twitter.com/intent/retweet?tweet_id=${tweet_id_str}"><i class="fa fa-twitter fa_logo fa-lg"></i> Retweet</a>
                      </div>
                      <div class="col-md-4" style="margin-top: 6px;">
                          <div class="twPc-button">
                                 <a id='${screen_name}' style="z-index: 1;" href=https://twitter.com/intent/follow?screen_name=${screen_name} class="btn-twitter"><i class="fa fa-twitter fa_logo fa-lg"></i> <span>Follow</span></a>
                          </div>
                      </div>
                    </div>
                    <div class="row" style="margin-top: 30px;">
                      <div class="twPc-divStats">
                          <ul class="twPc-Arrange">
                            <li class="twPc-ArrangeSizeFit">
                              <a target="_blank" href="https://twitter.com/${screen_name}/following" title="${tweet_obj_temp.friends_count} Following">
                                <span class="twPc-StatLabel twPc-block">Following</span>
                                <span class="twPc-StatValue">${tweet_obj_temp.friends_count}</span>
                              </a>
                            </li>
                            <li class="twPc-ArrangeSizeFit">
                              <a href="https://twitter.com/${screen_name}/followers" title="${tweet_obj_temp.followers_count} Followers" target="_blank">
                                <span class="twPc-StatLabel twPc-block">Followers</span>
                                <span class="twPc-StatValue">${tweet_obj_temp.followers_count}</span>
                              </a>
                            </li>
                            <li class="twPc-ArrangeSizeFit">
                              <span class="twPc-StatLabel twPc-block">Language</span>
                              <span class="twPc-StatValue">${tweet_obj_temp.language}</span>
                            </li>
                            <li class="twPc-ArrangeSizeFit">
                                  <span class="twPc-StatLabel twPc-block">Source</span>
                                  <span class="twPc-StatValue">${tweet_obj_temp.source}</span>
                            </li>
                            <li class="twPc-ArrangeSizeFit">
                                  <span class="twPc-StatLabel twPc-block">Created At</span>
                                  <span class="twPc-StatValue">${tweet_obj_temp.created_at}</span>
                            </li>
                          </ul>
                        </div>
                    </div>
                </div>
            `;
        // var tweet_card = '<div class="marquee well well-lg col-xs-12" id=ele' + indexAdd + ' style="padding:8px;margin-bottom: 10px"><div style="float: left; width: 6%"><img src=' + img_url + ' height=35 width=35></img></div><span style="width: 92%"><b>' + name + '</b>' + ' @' + screen_name + '  ' + '<font color="#0099CC"> ' + location + '</font>' + '</br>' + ' <font color="#060606">' + text + '</span></div>';
        allTweetElements.push(tweet_card);
    }else{
        var tweet_card = `
                <div class=" tweets-card well well-lg col-xs-12" id=ele${indexAdd}>
                    <div class="btn-group pull-right">
                        <button type="button" class="btn dropdown-toggle tweets-btn-menu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i class="ion-chevron-down"></i>
                        </button>
                        <ul class="dropdown-menu live_twt_dropdown">
                          <li><a href="#" onclick='tweetActions(this,"IMP",event, ${JSON.stringify(tweet_obj_temp)})'><img src="https://img.icons8.com/color/48/000000/box-important.png" style=" width: 25px;margin-right: 6px;float:left">Mark Important</a></li>
                          <li class="dropdown-submenu">
                            <a tabindex="-1" href="#" onclick="subMenuToggle(this, event)">Category</a>
                            <ul class="dropdown-menu live_twt_dropdown_submenu">
                              <li><a tabindex="-1" href="#" onclick='tweetActions(this,"CAT_IGN", event, ${JSON.stringify(tweet_obj_temp)})'>Ignore</a></li>
                              <li><a tabindex="-1" href="#" onclick='tweetActions(this,"CAT_FOL", event, ${JSON.stringify(tweet_obj_temp)})'>FollowUp</a></li>
                              <li><a tabindex="-1" href="#" onclick='tweetActions(this,"CAT_RES", event, ${JSON.stringify(tweet_obj_temp)})'>Research</a></li>
                            </ul>
                          </li>
                          <li class="dropdown-submenu">
                            <a tabindex="-1" href="#" onclick="subMenuToggle(this, event)">Classifications</a>
                            <ul class="dropdown-menu live_twt_dropdown_submenu">
                            ${live_twt_classification_binder(tweets_classifications, tweet_obj_temp)}
                            </ul>
                          </li>
                          <li role="separator" class="divider"></li>
                          <li><a href="#" data-toggle="modal" data-target="#role_mapping_modal" onclick='get_twts_dtl_from_role_mapping(${JSON.stringify(tweet_obj_temp)})'><img style="width: 30px; margin-right: 6px;float:left" src="https://img.icons8.com/bubbles/50/000000/groups.png">Assign to</a></li>
                        </ul>
                    </div>
                    <div style="float: left; width: 6%"><img src=${img_url} height=35 width=35></img>
                    </div><span style="width: 86%;color:#1565C0"><span style="font-weight: bold;">${name}</span> @<a href="${tweets_cloud_url}" target="_blank">${screen_name}</a>    <img src="/static/images/location2.png" height="auto" width="auto" style="margin-left:10px"></img><font color="#0099CC"> ${(location!=='' && location!==null)?location: 'Not available'}</font></br> <font color="#060606"> ${text}</span>

                    <div class="row pull-right" style="width:27%">
                        <script type="text/javascript" async="" src="https://platform.twitter.com/widgets.js"></script>
                        <div class="col-md-4" style="margin-top: 6px;">
                              <a class="btn-twitter" href="https://twitter.com/intent/tweet?in_reply_to=${tweet_id_str}"><i class="fa fa-twitter fa_logo fa-lg"></i> Reply</a>
                        </div>
                        <div class="col-md-4" style="margin-top: 6px;left: -7px;">
                              <a class="btn-twitter" href="https://twitter.com/intent/retweet?tweet_id=${tweet_id_str}"><i class="fa fa-twitter fa_logo fa-lg"></i> Retweet</a>
                        </div>
                        <div class="col-md-4">
                            <div class="twPc-button" style="margin-top: 6px;">
                                   <a id='${screen_name}' style="z-index: 1;" href=https://twitter.com/intent/follow?screen_name=${screen_name} class="btn-twitter"><i class="fa fa-twitter fa_logo fa-lg"></i> <span>Follow</span></a>
                            </div>
                        </div>
                    </div>
                    <div class="row" style="margin-top: 30px;">
                      <div class="twPc-divStats">
                            <ul class="twPc-Arrange">
                              <li class="twPc-ArrangeSizeFit">
                                <a target="_blank" href="https://twitter.com/${screen_name}/following" title="${tweet_obj_temp.friends_count} Following">
                                  <span class="twPc-StatLabel twPc-block">Following</span>
                                  <span class="twPc-StatValue">${tweet_obj_temp.friends_count}</span>
                                </a>
                              </li>
                              <li class="twPc-ArrangeSizeFit">
                                <a href="https://twitter.com/${screen_name}/followers" title="${tweet_obj_temp.followers_count} Followers" target="_blank">
                                  <span class="twPc-StatLabel twPc-block">Followers</span>
                                  <span class="twPc-StatValue">${tweet_obj_temp.followers_count}</span>
                                </a>
                              </li>
                              <li class="twPc-ArrangeSizeFit">
                                <span class="twPc-StatLabel twPc-block">Language</span>
                                <span class="twPc-StatValue">${tweet_obj_temp.language}</span>
                              </li>
                              <li class="twPc-ArrangeSizeFit">
                                    <span class="twPc-StatLabel twPc-block">Source</span>
                                    <span class="twPc-StatValue">${tweet_obj_temp.source}</span>
                              </li>
                              <li class="twPc-ArrangeSizeFit">
                                    <span class="twPc-StatLabel twPc-block">Created At</span>
                                    <span class="twPc-StatValue">${tweet_obj_temp.created_at}</span>
                              </li>
                            </ul>
                        </div>
                    </div>
                </div>
            `;
        // var tweet_card = '<div class="marquee well well-lg col-xs-12" id=ele' + indexAdd + ' style="padding:8px;margin-bottom: 10px"><div style="float: left; width: 6%"><img src=' + img_url + ' height=35 width=35></img></div><span style="width: 92%"><b>' + name + '</b>' + ' @' + screen_name + '  ' + '<font color="#0099CC"> ' + location + '</font>' + '</br>' + ' <font color="#060606">' + text + '</span></div>';
        allTweetElements.push(tweet_card);
        // if(indexAdd >10)
        // {
        //     var name="ele"+indexRemove;
        //     indexRemove++;
        //     var remele=document.getElementById(name);
        //     main.removeChild(remele);
        // }
    }



    indexAdd++;
//have a counter i - append i with name of element as ele1 or ele2. Remove ele+i when j exceeds 8
    // sourceDeviceChart(tweet_obj_temp);
}

$(document).ready(function() {

    var suspend = false, time_out = 1000;
    function tweetsMarquee() {
        if (allTweetElements.length > 0) {
            if(!suspend && !$("#role_mapping_modal").is(":visible")){
                time_out = 1000
                $('#main').prepend(allTweetElements.shift())
                // if($('.marquee').length>25){
                //     $('.marquee').last().remove()
                // }
            }
            setTimeout(tweetsMarquee, time_out);
        } else {
            setTimeout(tweetsMarquee, 0);
        }
    }
    tweetsMarquee();

    var $marquee = $('#main')
    $marquee.on({
        mouseover:function () {
            suspend = true
            $( ".marquee" ).addClass( "marquee-pause" )
        },
        mouseout:function () {
            suspend = false
            $( ".marquee" ).removeClass( "marquee-pause" )
        }
    })

    /*Side bar*/
    // $('#sidebar').toggleClass('active');
    // $('#sidebarCollapse').on('click', function () {
    //     $('#sidebar').toggleClass('active');
    // });
    socket.emit('get_all_users','All users');
});


function colores_google(n) {
    var colores_g = ["#3276B1", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
    return colores_g[n % colores_g.length];
}



$(function() {

    $('#sentimentClassificationFunction').change(function() {
        if(sentimentClassificationFunction == 0){
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



class TweetsCloud{
  constructor(){
    this.WORD_CLOUD_REFRESH_DELAY = WORD_CLOUD_REFRESH_DELAY
  }
  urlify(text) {
      var urlRegex = /(https?:\/\/[^\s]+)/g;
      return text.replace(urlRegex, function(url) {
          return `<span class="anchor"><a href='${url}' target="_blank">${url}</a></span>`;
      })
  }
  updateWordCloud(){
    socket.emit("getTopKKeywordsAndHashTags", "No Data!");
    setTimeout(updateWordCloud, WORD_CLOUD_REFRESH_DELAY);
  }
  colores_google(n) {
    var colores_g = ["#3276B1", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
    return colores_g[n % colores_g.length];
  }
  showHashtagTweetsFromBubble(element,evt,name){
    if(hastag_cloud_tweets){
      socket.emit('hastag_cloud_tweets', hastag_cloud_tweets, name);
    }
  }
  classes(root) {
    var classes = [];
    function recurse(name, node) {
      if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
      else classes.push({packageName: node.color, className: node.name, value: node.size});
    }
    recurse(null, root);
    return {children: classes};
  }
  drawKeywordBubbles(jsonString){
      var jsonObject = JSON.parse(jsonString);
      keywords_cloud_tweets = jsonObject;
      Highcharts.chart('wordcloud', {
        plotOptions: {
              wordcloud: {
                minFontSize:25,
                maxFontSize:100
              },
              series: {
                  cursor: 'pointer',
                  events: {
                      click: function (event) {
                        showKeywordTweetsFromBubble(event.target, event, event.target.textContent)
                      }
                  }
              }
          },
        series: [{
          type: 'wordcloud',
          data: jsonObject.children,
          name: 'Occurrences'
        }],
        title: {
          text: 'Tweets Keyword Cloud'
        }
      });
  }
  drawHashTagBubbles(jsonString){
        var jsonObject = JSON.parse(jsonString);
        hastag_cloud_tweets = jsonObject;
        Highcharts.chart('hashtag_wordcloud', {
          plotOptions: {
                wordcloud: {
                  minFontSize:25,
                  maxFontSize:100
                },
                series: {
                    cursor: 'pointer',
                    events: {
                        click: function (event) {
                          showHashtagTweetsFromBubble(event.target, event, event.target.textContent)
                            // alert(
                            //     this.name + ' clicked\n' +
                            //     'Alt: ' + event.altKey + '\n' +
                            //     'Control: ' + event.ctrlKey + '\n' +
                            //     'Meta: ' + event.metaKey + '\n' +
                            //     'Shift: ' + event.shiftKey
                            // );
                        }
                    }
                }
            },
          series: [{
            type: 'wordcloud',
            data: jsonObject.children,
            name: 'Occurrences'
          }],
          title: {
            text: 'Tweets Hashtags Cloud'
          }
        });
  }
}

const tweetsCloudClass = new TweetsCloud()


$("#tweets_cloud").css("display","none");
function test(){
  $("tweet_profile_card")
  $("#tweets_cloud").css("display","block")
  let twpcTemplate = `
  <% if(twitterUserProfile.profile_banner_url){ %>
      <a class="twPc-bg twPc-block" style="background-image: url(<%= twitterUserProfile.profile_banner_url %>/600x200);" >
      </a>
  <% } else{ %>
      <a class="twPc-bg twPc-block">
      </a>
  <% } %>
   <div>
      <div class="twPc-button">
         <!-- Twitter Button | you can get from: https://about.twitter.com/tr/resources/buttons#follow -->
         <iframe id="twitter-widget-0" scrolling="no" frameborder="0" allowtransparency="true" class="twitter-follow-button twitter-follow-button-rendered" style="position: static; visibility: visible; width: 79px; height: 28px;" title="Twitter Follow Button" src="https://platform.twitter.com/widgets/follow_button.d753e00c3e838c1b2558149bd3f6ecb8.en.html#dnt=true&amp;id=twitter-widget-0&amp;lang=en&amp;screen_name=<%= twitterUserProfile.screen_name %>&amp;show_count=false&amp;show_screen_name=false&amp;size=l&amp;time=1562252830258" data-screen-name="<%= twitterUserProfile.screen_name %>"></iframe>
         <script id="twitter-wjs" src="http://platform.twitter.com/widgets.js"></script><script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
         <!-- Twitter Button -->
      </div>
      <a title="<%= twitterUserProfile.name %>" href="https://twitter.com/<%= twitterUserProfile.screen_name %>" class="twPc-avatarLink" target="_blank">
      <img alt="<%= twitterUserProfile.name %>" src="<%= twitterUserProfile.profile_image_url_https %>" class="twPc-avatarImg">
      </a>
      <div class="twPc-divUser">
         <div class="twPc-divName">
            <a href="https://twitter.com/<%= twitterUserProfile.screen_name %>" target="_blank"><%= twitterUserProfile.name %></a>
         </div>
         <span>
         <a href="https://twitter.com/<%= twitterUserProfile.screen_name %>" target="_blank" style="font-size: 14px;">@<span><%= twitterUserProfile.screen_name %></span></a>
         </span>
      </div>
      <div class="twPc-divStats">
         <ul class="twPc-Arrange">
            <li class="twPc-ArrangeSizeFit">
               <a target="_blank" href="https://twitter.com/<%= twitterUserProfile.screen_name %>" title="<%= twitterUserProfile.screen_name %> Tweet">
               <span class="twPc-StatLabel twPc-block">Tweets</span>
               <span class="twPc-StatValue"><%= twitterUserProfile.statuses_count %></span>
               </a>
            </li>
            <li class="twPc-ArrangeSizeFit">
               <a target="_blank" href="https://twitter.com/<%= twitterUserProfile.screen_name %>/following" title="<%= twitterUserProfile.screen_name %> Following">
               <span class="twPc-StatLabel twPc-block">Following</span>
               <span class="twPc-StatValue"><%= twitterUserProfile.friends_count %></span>
               </a>
            </li>
            <li class="twPc-ArrangeSizeFit">
               <a href="https://twitter.com/<%= twitterUserProfile.screen_name %>/followers" title="<%= twitterUserProfile.screen_name %> Followers" target="_blank">
               <span class="twPc-StatLabel twPc-block">Followers</span>
               <span class="twPc-StatValue"><%= twitterUserProfile.followers_count %></span>
               </a>
            </li>
            <li class="twPc-ArrangeSizeFit">
               <a href="#" title="<%= twitterUserProfile.language %>" target="_blank">
               <span class="twPc-StatLabel twPc-block">Language</span>
               <span class="twPc-StatValue"><%= twitterUserProfile.language %></span>
               </a>
            </li>
            <li class="twPc-ArrangeSizeFit">
               <a href="#" title="New Delhi, India">
               <span class="twPc-StatLabel twPc-block">Location</span>
               <span class="twPc-StatValue" style="display:flex">
               <img src="/static/images/location2.png" height="auto" width="auto">
               <span class="twPc-StatValue" style="margin-left:4px"><%= twitterUserProfile.location %></span>
               </span>
               </a>
            </li>
         </ul>
      </div>
  `;
  // $.ajax({
  //        url: "/tweets_cloud_api_data?profile_banner_url=https://pbs.twimg.com/profile_banners/115887279/1537187723&screen_name=RoflGandhi_&followers_count=369860&friends_count=437&location=Rajiv%20Chowk%20&statuses_count=66150&name=Rofl%20Gandhi&language=en&profile_image_url_https=https://pbs.twimg.com/profile_images/1151116427060846592/tV-pfY1X_normal.jpg#0.9784211921936117",
  //        contentType: "application/json",
  //        dataType: 'json',
  //        success: function(result){
  //          let takeTopKHashtags = JSON.stringify(result.takeTopKHashtags);
  //          let takeTopKKeywords = JSON.stringify(result.takeTopKKeywords);
  //          if(takeTopKHashtags.length>35)
  //              tweetsCloudClass.drawHashTagBubbles(takeTopKHashtags);
  //          if(takeTopKKeywords.length>35)
  //              tweetsCloudClass.drawKeywordBubbles(takeTopKKeywords);
  //        }
  //    })
}
