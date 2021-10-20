/*
#title           : myjs.js
#description     : Custom JS for front-end
#author		     : Aswin Jose
#email           : aswin1906@gmail.com
#date            : 20160210
#version         : 1.2
*/
// var socket = io.connect('https://quantumplay5.azurewebsites.net', {'force new connection': true});
//var socket = io.connect('https://quantumplay2.azurewebsites.net', {'force new connection': true});
// var socket = io.connect('http://quantumtp.cloudapp.net', {'force new connection': true});
//  var socket = io.connect('https://twitterplayfeb.azurewebsites.net', {'force new connection': true});
//var socket = io.connect('https://twitterplay9.azurewebsites.net', {'force new connection': true});
//var socket = io.connect('https://quantumtp.azurewebsites.net', {'force new connection': true});
//var socket = io.connect('http://twitterplay.cloudapp.net', {'force new connection': true});
// var socket = io.connect('http://10.6.9.32:8080/', {'force new connection': true});
//var socket = io.connect('http://localhost:8080/', {'force new connection': true});
//var socket = io.connect('https://quantumplay.azurewebsites.net', {'force new connection': true});
//var socket = io.connect('https://quantumplay4.azurewebsites.net',{'force new connection': true});
//var socket = io.connect('https://socialzoom.azurewebsites.net',{'force new connection': true});
let appConfig = appSettings['appConfig'];
let node_machine = appConfig['node_machine'];
let protocol = appConfig['protocol'];
var socket = io.connect(protocol + '://' + node_machine, {
    'force new connection': true
});
let pelias_host = appConfig["pelias_machine"];


/* AngularJS Starts Here */
var app = angular.module("profileMod", ["Twitterplay.services", "leaflet-directive"]);
app.controller("profileController", [ "$scope","remoteCall", "$compile", function($scope, remoteCall, $compile) {
    try {
        $scope.markers= [];
        var keywordMap = new Object(); //Maintain a list of track keywords.
        var keywordMapSize = 0;
        var tweetsCount = 0;
        var startTime = 0;
        var reTweetsCount = 0;
        var saveAllFilesCount = 0;
        var saveAllFilesTracker = new Object();
        var instagramFunction = 0;
        var sentimentClassificationFunction = 1;
        var showBufferedTweets = 0;
        var tweets_dtls_for_donut = {};
        let countryLanguagesValue = {
            "en": true
        };
        var allClientTimeouts = [];
        var allClientIntervals = [];
        var startTwtDelay = null, startTwtDelayTime=-1; // If startTwtDelayTime=0(It shows the alert message immediately) then for further minutes, If no tweets processed for 2 min for the keywords then show "waiting for the tweets" in snackbar for every 2 minutes...Every five minutes should be calculated of last processed tweets,
    
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
        var CUSTOM_KEYWORD_LIMITS;
    
        // Set the global configs to synchronous
        $.ajaxSetup({
            async: false
        });
    
        // $.getJSON() request is now synchronous...
        var data = appSettings['default_values_client'];
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
        CUSTOM_KEYWORD_LIMITS = data["CUSTOM_KEYWORD_LIMITS"];        
    
        function setAllSettingsValues(appSettings) {
            let page_settings = appSettings['page_settings'];
            if (page_settings.hasOwnProperty('footer')) {
                $(".footer span").html(page_settings['footer'])
            }
        }
        setAllSettingsValues(appSettings);
        // $.getJSON('/static/default_values.json' ,function(data){
        //   //alert("yes started");
        //   WORD_CLOUD_REFRESH_DELAY = data["WORD_CLOUD_REFRESH_DELAY"];
        //   INITIAL_DELAY_TOP_K_MOST_INFLUENTIAL_USERS = data["INITIAL_DELAY_TOP_K_MOST_INFLUENTIAL_USERS"];
        //   INITIAL_DELAY_TOP_K_MOST_ACTIVE_USERS = data["INITIAL_DELAY_TOP_K_MOST_ACTIVE_USERS"];
        //   INITIAL_DELAY_TOP_K_MOST_MENTIONED_USERS = data["INITIAL_DELAY_TOP_K_MOST_MENTIONED_USERS"];
        //   INITIAL_DELAY_TOP_K_MAX_RETWEETS = data["INITIAL_DELAY_TOP_K_MAX_RETWEETS"];
        //   INITIAL_DELAY_TOP_K_INSTA_PHOTOS = data["INITIAL_DELAY_TOP_K_INSTA_PHOTOS"];
        //   INITIAL_DELAY_TOP_K_SENTIMENT_COUNT = data["INITIAL_DELAY_TOP_K_SENTIMENT_COUNT"];
        //   INITIAL_DELAY_TOP_K_LANG_STAT = data["INITIAL_DELAY_TOP_K_LANG_STAT"];
        //   FINAL_DELAY_TOP_K_MOST_INFLUENTIAL_USERS = data["FINAL_DELAY_TOP_K_MOST_INFLUENTIAL_USERS"];
        //   FINAL_DELAY_TOP_K_MOST_ACTIVE_USERS = data["FINAL_DELAY_TOP_K_MOST_ACTIVE_USERS"];
        //   FINAL_DELAY_TOP_K_MOST_MENTIONED_USERS = data["FINAL_DELAY_TOP_K_MOST_MENTIONED_USERS"];
        //   FINAL_DELAY_TOP_K_MAX_RETWEETS = data["FINAL_DELAY_TOP_K_MAX_RETWEETS"];
        //   FINAL_DELAY_TOP_K_INSTA_PHOTOS = data["FINAL_DELAY_TOP_K_INSTA_PHOTOS"];
        //   FINAL_DELAY_TOP_K_LANG_STAT = data["FINAL_DELAY_TOP_K_LANG_STAT"];
        //   PASSWORD_TRIAL_VERSION = data["PASSWORD_TRIAL_VERSION"];
        //   TRIAL_TWEETS_LIMIT = data["TRIAL_TWEETS_LIMIT"];
        //   LANGUAGES_FOR_DISPLAY = data["LANGUAGES_FOR_DISPLAY"];
        //   DEFAULT_NUMBER = data["DEFAULT_NUMBER"];
        //   DELAY_CHECK_FOR_MAX_LIMIT = data["DELAY_CHECK_FOR_MAX_LIMIT"];
        //   MAX_LIMIT = data["MAX_LIMIT"];
        // AUTOSAVE_RECORDLIMIT = data["AUTOSAVE_RECORDLIMIT"];
        // AUTOEXIT_BUFFERLIMIT = data["AUTOEXIT_BUFFERLIMIT"];
        // });
    
        // Set the global configs back to asynchronous
        $.ajaxSetup({
            async: true
        });
    
    
    
        var indexAdd = 0;
        var indexRemove = 0;
        var indexAddNeg = 0;
        var indexRemoveNeg = 0;
        var indexAddPos = 0;
        var indexRemovePos = 0;
        var indexAddNeutral = 0;
        var indexRemoveNeutral = 0;
    
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
        $("#loading-indicator").hide();
        $(function() {
            Example.init({
                "selector": ".bb-alert"
            });
        });
    
        $('form').submit(function() {
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
    
            that.show = function(text, type) {
                clearTimeout(hideHandler);
                elem.removeClass("alert-danger alert-success alert-info alert-warning").addClass((type=="danger")?"alert-danger":(type=="success")?"alert-success":(type=="warning")?"alert-warning":"alert-info");
                elem.find("span").html(text);
                elem.delay(200).fadeIn().delay(10000).fadeOut();
            };
            // that.danger = function(text) {
            //     clearTimeout(hideHandler);
            //     elem = $(".bb-alert-dg");
            //     elem.find("span").html(text);
            //     elem.delay(200).fadeIn().delay(10000).fadeOut();
            // };
            // that.success = function(text) {
            //     clearTimeout(hideHandler);
            //     elem = $(".bb-alert-success");
            //     elem.find("span").html(text);
            //     elem.delay(200).fadeIn().delay(10000).fadeOut();
            // };
    
            return that;
        }());        

        // $('.form-wrapper .custom-search').addClass("active");
        allClientTimeouts.push(setTimeout(function() {
            socket.emit("countryLanguages", countryLanguagesValue); // Default language is english
            $("#btn_all_hashtag").click(function() {
                var thisButton = this;
                if (cnfPopupFlg) {
                    bootbox.confirm("This operation will clear the current screen. Do you still want to continue?", function(result) {
                        if (result == true) {
    
                            trackingAllHashtags = true;
                            trackingAllKeywords = false;
                            trackingCustomKeywords = false;
    
                            clearAll();
                            socket.emit("trackallhashtags", "No Data!");
                            Example.show("Tracking started for all hashtag");
                            // $("#inputkeyword").attr("disabled", true);
                            searcBarEnable(true)
                            // $(".btn-group-vertical > .btn").removeClass("active");
                            // $(".tz-btn-group .custom-search").addClass("remove-arrow");
                            // $(".tz-btn-group > button").removeClass("active");
                            // $(thisButton).addClass("active");
                            clock.setTime(0); //FilpClock comment
                            clock.start(); //FilpClock comment
                            //clearTimer();
                            //startTimer();
                        }
                    });
                } else {
                    trackingAllHashtags = true;
                    trackingAllKeywords = false;
                    trackingCustomKeywords = false;
                    socket.emit("trackallhashtags", "No Data!");
                    Example.show("Tracking started for all hashtag");
                    // $("#inputkeyword").attr("disabled", true);
                    searcBarEnable(true);
                    // $(".btn-group-vertical > .btn").removeClass("active");
                    // $(".tz-btn-group .custom-search").addClass("remove-arrow");
                    // $(".tz-btn-group > button").removeClass("active");
                    // $(thisButton).addClass("active");
                    clock.setTime(0); //FilpClock comment
                    clock.start(); //FilpClock comment
                    //clearTimer();
                    //startTimer();
                }
                cnfPopupFlg = 1;
    
            });
    
            $("#btn_all_keyword").click(function() {
                var thisButton = this;
                if (cnfPopupFlg) {
                    bootbox.confirm("This operation will clear the current screen. Do you still want to continue?", function(result) {
                        if (result == true) {
                            clearAll();
                            trackingAllHashtags = false;
                            trackingAllKeywords = true;
                            trackingCustomKeywords = false;
                            socket.emit("trackallkeywords", "No Data!");
                            Example.show("Tracking started for all keywords");
                            // $("#inputkeyword").attr("disabled", true);
                            searcBarEnable(true);
                            // $(".tz-btn-group > button").removeClass("active");
                            // $(".btn-group-vertical > .btn").removeClass("active");
                            // $(".tz-btn-group .custom-search").addClass("remove-arrow");
                            // $(thisButton).addClass("active");
                            clock.setTime(0); //FilpClock comment
                            clock.start(); //FilpClock comment
                            //clearTimer();
                            //startTimer();
                        }
                    });
                } else {
                    trackingAllHashtags = false;
                    trackingAllKeywords = true;
                    trackingCustomKeywords = false;
    
                    socket.emit("trackallkeywords", "No Data!");
                    Example.show("Tracking started for all keywords");
                    // $("#inputkeyword").attr("disabled", true);
                    searcBarEnable(true);
                    // $(".tz-btn-group > button").removeClass("active");
                    // $(".btn-group-vertical > .btn").removeClass("active");
                    // $(".tz-btn-group .custom-search").addClass("remove-arrow");
                    // $(thisButton).addClass("active");
                    clock.setTime(0); //FilpClock comment
                    clock.start(); //FilpClock comment
                    //clearTimer();
                    //startTimer();
                }
                cnfPopupFlg = 1;
            });
            $("#btn_custom_keyword").click(function(e) {
                var thisButton = this;
                if (cnfPopupFlg) {
                    bootbox.confirm("This operation will clear the current screen. Do you still want to continue?", function(result) {
                        if (result == true) {
                            trackingAllHashtags = false;
                            trackingAllKeywords = false;
                            trackingCustomKeywords = true;
    
                            clearAll();
                            Example.show("Enter hashtag or keyword in the textbox provided");
                            // $("#inputkeyword").attr("disabled", false);
                            searcBarEnable(false);
                            // $(".btn-group-vertical > .btn").removeClass("active");
                            // $(".tz-btn-group > button").removeClass("active");
                            // $(thisButton).removeClass("remove-arrow");
                            // $(thisButton).addClass("active");
    
                        }
                    });
                } else {
                    trackingAllHashtags = false;
                    trackingAllKeywords = false;
                    trackingCustomKeywords = true;
    
                    Example.show("Enter hashtag or keyword in the textbox provided");
                    // $("#inputkeyword").attr("disabled", false);
                    searcBarEnable(false);
                    // $(".btn-group-vertical > .btn").removeClass("active");
                    // $(".tz-btn-group > button").removeClass("active");
                    // $(thisButton).removeClass("remove-arrow");
                    // $(thisButton).addClass("active");
                }
                cnfPopupFlg = 1;
    
            });
    
        }, 50));
        // socket.on('twts_time_delay_msg', function() {
        //     Example.show("Waiting for the tweets...");
        // })
        socket.on('dynamic_field_data_loader', function(onloadDataCollection) {
            sessionStorage.setItem('mongoFieldData', JSON.stringify(onloadDataCollection))
        })
        var twts_src_dict = {}
        socket.on('takeTweet', function(msg, keywordMap, totalTweetCount) {
            let full_text = mixin.get_tweet_text(msg);
            msg.full_text= full_text;
            //$('#messages').prepend($('<li>').text(msg.text));
            if (tweetsCount == 0) {
                startTime = new Date().getTime();
            }
            
            if (msg.coordinates != null || msg.place != null || (msg.user.location != null && msg.user.location.trim().length>1)) {
                gpscount++;
                $("#gpscount").text(gpscount);
                tweets_dtls_for_donut['gpscount'] = {
                    "label": "Tweets with Gps",
                    "count": gpscount
                };
                let screen_name = msg.user.screen_name, 
                        location = msg.user.location
                        text = msg.full_text,
                        profile_image_url_https = msg.user.profile_image_url_https,
                        name  = msg.user.name,
                        tweet_id_str  = msg.id_str;

                if(msg.coordinates != null || msg.place != null){
                    var actualCoordinates = null;
                    if (msg.coordinates != null && msg.coordinates != "" && msg.coordinates != undefined) {
                        actualCoordinates = msg.coordinates.coordinates;
                    } else if (msg.place != null && msg.place != "" && msg.place != undefined) {
                        actualCoordinates = msg.place.bounding_box.coordinates[0][0];                        
                    }  
                    
                    let mapMarkerData = {
                        lat: actualCoordinates[1],
                        lng: actualCoordinates[0],
                        screen_name,
                        location,
                        text,
                        profile_image_url_https,
                        name,
                        tweet_id_str
                    }
                    addressPointsToMarkers(mapMarkerData);
                }
                else if(msg.user.location != null && msg.user.location.trim().length>1){ //Checking length>1 to exclude special characters like icons
                
                    let mapMarkerData = {
                        screen_name,
                        location,
                        text,
                        profile_image_url_https,
                        name,
                        tweet_id_str
                    }
                    getMapCoordinates(mapMarkerData);               
                }
                
                // addMarkerToMap(actualCoordinates[1], actualCoordinates[0], msg.text, msg.user.profile_image_url_https, msg.user.name, msg.user.screen_name, msg.user.location);
            }
            
            
            keepadd(full_text, msg.user.profile_image_url_https, msg.user.name, msg.user.screen_name, msg.user.location, keywordMap);
            var source = (msg.source) ? $(msg.source).text().replace("Twitter", "").replace("for", "").trim() : msg.source;
            if (typeof(twts_src_dict[source]) == "undefined") {
                twts_src_dict[source] = {
                    name: source,
                    y: 1
                }
            } else {
                twts_src_dict[source]["y"]++
            }
            tweetsCount++;
            var retweeted_status = msg.retweeted_status;
            if (retweeted_status && retweeted_status !== "null" && retweeted_status !== "undefined") {
                reTweetsCount++;
            }
    
            if (tweetsCount > TRIAL_TWEETS_LIMIT && !password_enabled && !prompting) {
                prompting = true;
                var pass = prompt('Please enter password to continue using the application');
                if (!(pass === password)) {
                    logout();
                }
                password_enabled = true;
                prompting = false;
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
    
            if (twbuffercount >= buffermaxlimit && twBufferMaxcounter < 1) {
    
                TwBufferLimitreached = "Y";
                twBufferMaxcounter++;
                bufferExceededTweetWrite();
            }
    
    
            displayTotalTweets(tweetsCount);
            displayTotalReTweets(reTweetsCount);
            displayReTweetPercentage(tweetsCount, reTweetsCount);
            displayThroughput(tweetsCount);
        });
    
        socket.on('takeNegTweet', function(msg) {
            if (sentimentClassificationFunction != 9) {
                keepaddNeg(msg.text, msg.profile_image_url_https, msg.name, msg.screen_name, msg.location);
            }
        });
    
        socket.on('takePosTweet', function(msg) {
            if (sentimentClassificationFunction != 9) {
                keepaddPos(msg.text, msg.profile_image_url_https, msg.name, msg.screen_name, msg.location);
            }
        });
    
        socket.on('takeNeutralTweet', function(msg) {
            if (sentimentClassificationFunction != 9) {
                keepaddNeutral(msg.text, msg.profile_image_url_https, msg.name, msg.screen_name, msg.location);
            }
        });
    
    
        function getConfirmation() {
            bootbox.confirm("Are you sure?", function(result) {
                Example.show("Confirm result: " + result);
            });
        }
    
        function setPlaceHolder(text) {
            $("#inputkeyword").attr("placeholder", text);
        }
    
        function enableMe(id) {
            $("#" + id).attr("disabled", false);
        }
    
        function disableMe(id) {
            $("#" + id).attr("disabled", true);
        }
    
        function getTopKeywordsFile() {
            $("#download").text("");
            $("#loading-indicator").show();
            socket.emit("getTopKeywordsFile", "No Data!");
        }
    
        function getTweetsFile() {
            //socket.emit("gettweetsfile", "No Data!");
            $("#download").text("");
            $("#loading-indicator").show();
            socket.emit("getAllTweetsFile", "No Data!");
        }
    
    
    
    
        function getTopKeywordsFileAtMaxLimit() {
            $("#download").text("");
            $("#loading-indicator").show();
            socket.emit("getTopKeywordsFile", "SaveAll!");
        }
    
        function getTweetsFileAtMaxLimit() {
            $("#download").text("");
            $("#loading-indicator").show();
            socket.emit("getAllTweetsFile", "SaveAll!");
            Example.show("saving All tweets please wait.... total tweets   : " + tweetsCount);
            console.log("saving All tweets  user file   " + tweetsCount + " maxcounter = " + maxcounter);
        }
    
        function getMaxReTweetsFileAtMaxLimit() {
            $("#download").text("");
            $("#loading-indicator").show();
            socket.emit("getTopKMaxReTweetsFile", "SaveAll!");
            console.log("saving Retweet max  user file   " + tweetsCount + " maxcounter = " + maxcounter);
        }
    
        function getTopKMostInfluentialUsersFileAtMaxLimit() {
            $("#download").text("");
            $("#loading-indicator").show();
            socket.emit("getTopKMostInfluentialUsersFile", "SaveAll!");
            console.log("saving Most influential user file   " + tweetsCount + " maxcounter = " + maxcounter);
        }
    
        function getTopKMostActiveUsersFileAtMaxLimit() {
            $("#download").text("");
            $("#loading-indicator").show();
            socket.emit("getTopKMostActiveUsersFile", "SaveAll!");
            console.log("saving Active user file   " + tweetsCount + " maxcounter = " + maxcounter);
        }
    
        function getAllRetweetFileAtMaxLimit() {
            $("#download").text("");
            $("#loading-indicator").show();
            socket.emit("getFullReTweetsFile", "SaveAll!");
            console.log("saving All Retweet files..    " + tweetsCount + " maxcounter = " + maxcounter);
        }
    
        function getTopKMostInfluentialUsersFile() {
            $("#download").text("");
            $("#loading-indicator").show();
            socket.emit("getTopKMostInfluentialUsersFile", "No Data!");
        }
    
        function getTopKMostActiveUsersFile() {
            $("#download").text("");
            $("#loading-indicator").show();
            socket.emit("getTopKMostActiveUsersFile", "No Data!");
        }
    
        function getMaxReTweetsFile() {
            $("#download").text("");
            $("#loading-indicator").show();
            socket.emit("getTopKMaxReTweetsFile", "No Data!");
    
        }
    
        function getPosTweetsFile() {
            $("#download").text("");
            $("#loading-indicator").show();
            socket.emit("getPosTweetsFile", "No Data!");
        }
    
        function getNegTweetsFile() {
            $("#download").text("");
            $("#loading-indicator").show();
            socket.emit("getNegTweetsFile", "No Data!");
        }
    
        function getNeutralTweetsFile() {
            $("#download").text("");
            $("#loading-indicator").show();
            socket.emit("getNeutralTweetsFile", "No Data!");
        }
        $scope.getNeutralTweetsFile =getNeutralTweetsFile;
        $scope.getNegTweetsFile =getNegTweetsFile;
        $scope.getPosTweetsFile =getPosTweetsFile;
        $scope.getMaxReTweetsFile =getMaxReTweetsFile;
        $scope.getTopKMostActiveUsersFile =getTopKMostActiveUsersFile;
        $scope.getTopKMostInfluentialUsersFile =getTopKMostInfluentialUsersFile;
        $scope.getAllRetweetFileAtMaxLimit =getAllRetweetFileAtMaxLimit;
        $scope.getTopKMostActiveUsersFileAtMaxLimit =getTopKMostActiveUsersFileAtMaxLimit;
        $scope.getTopKMostInfluentialUsersFileAtMaxLimit =getTopKMostInfluentialUsersFileAtMaxLimit;
        $scope.getMaxReTweetsFileAtMaxLimit =getMaxReTweetsFileAtMaxLimit;
        $scope.getTweetsFileAtMaxLimit =getTweetsFileAtMaxLimit;
        $scope.getTopKeywordsFileAtMaxLimit =getTopKeywordsFileAtMaxLimit;
        $scope.getTweetsFile =getTweetsFile;
        $scope.getTopKeywordsFile =getTopKeywordsFile;

    
        function displayThroughput(count) {
            var duration = new Date().getTime() - startTime;
            duration = duration / (1000 * 60);
            if (duration > 0) {
                $("#throughput").text(Math.floor(count / duration));
                tweets_dtls_for_donut['throughput'] = {
                    "label": "Tweets/Minute",
                    "count": Math.floor(count / duration)
                };
            } else {
                $("#throughput").text("NA");
                tweets_dtls_for_donut['throughput'] = {
                    "label": "Tweets/Minute",
                    "count": "NA"
                };
            }
        }
    
        function displayTotalTweets(count) {
            $("#totalTweets").text(count);
        }
    
        function displayTotalReTweets(count) {
            $("#totalReTweets").text(count);
        }
    
        function displayReTweetPercentage(totalTweets, totalRetweets) {
            var percentage = 0.0;
            if (totalTweets == 0) {
                percentage = 0;
            } else {
                percentage = (totalRetweets / totalTweets) * 100;
            }
            $("#reTweetsPercentage").text(percentage.toFixed(2));
        }
    
        function displayBufferedTweets(count) {
            // if(showBufferedTweets == 1)
            $("#lagging_btw_client_server").text(count);
        }
    
        function clearAll() {
            socket.emit("untrackall", "No Data!");
            resetGUI();
        }
    
    
        socket.on('takeTopKeywordsFile', function(filename, download_path) {
            //$("#download").attr("href", '/givemefile?name='+filename);
            if (filename != "NoFileExist") {
                changeViewFileDownload(filename, download_path);
                $("#download_words_excel").text("Update keywords file");
            } else {
                $("#loading-indicator").hide();
            }
        });
    
        socket.on('takeAllTweetsFile', function(filename, download_path) {
            //$("#download").attr("href", '/givemefile?name='+filename);
    
            if (filename != "NoFileExist") {
                changeViewFileDownload(filename, download_path);
                $("#download_tweets_excel").text("Update all tweets file");
            } else {
                $("#loading-indicator").hide();
            }
        });
    
        socket.on('takeTopKMostActiveUsersFile', function(filename, download_path) {
            //$("#download").attr("href", '/givemefile?name='+filename);
            if (filename != "NoFileExist") {
                changeViewFileDownload(filename, download_path);
                $("#download_active_users_excel").text("Update most active users list");
            } else {
                $("#loading-indicator").hide();
            }
        });
    
        socket.on('takeTopKMostInfluentialUsersFile', function(filename, download_path) {
            //$("#download").attr("href", '/givemefile?name='+filename);
            if (filename != "NoFileExist") {
                changeViewFileDownload(filename, download_path);
                $("#download_influential_users_excel").text("Update most influential users file");
            } else {
                $("#loading-indicator").hide();
            }
        });
    
        socket.on('takeTopKMaxReTweetsFile', function(filename, download_path) {
            //$("#download").attr("href", '/givemefile?name='+filename);
            if (filename != "NoFileExist") {
                changeViewFileDownload(filename, download_path);
                $("#download_retweets_excel").text("Update most retweeted tweets file");
            } else {
                $("#loading-indicator").hide();
            }
        });
        socket.on('takeFullRTFile', function(filename) {
            //$("#download").attr("href", '/givemefile?name='+filename);
            if (filename != "NoFileExist") {
                changeViewFileDownload(filename);
                $("#download_retweets_excel").text("Update All unique retweeted tweets file");
            } else {
                $("#loading-indicator").hide();
            }
        });
    
        socket.on("displaycount", function(msg) {
            Example.show("Total Keywords : " + msg + "  Batch :  " + keywordMapSize);
        });
    
        socket.on('takePosTweetsFile', function(filename) {
            //$("#download").attr("href", '/givemefile?name='+filename);
            if (filename != "NoFileExist") {
                changeViewFileDownload(filename);
                $("#download_pos_tweets_excel").text("Update positive tweets file");
            } else {
                $("#loading-indicator").hide();
            }
        });
    
        socket.on('takeNegTweetsFile', function(filename) {
            //$("#download").attr("href", '/givemefile?name='+filename);
            if (filename != "NoFileExist") {
                changeViewFileDownload(filename);
                $("#download_neg_tweets_excel").text("Update negative tweets file");
            } else {
                $("#loading-indicator").hide();
            }
        });
    
        socket.on('takeNeutralTweetsFile', function(filename) {
            //$("#download").attr("href", '/givemefile?name='+filename);
            if (filename != "NoFileExist") {
                changeViewFileDownload(filename);
                $("#download_neutral_tweets_excel").text("Update neutral tweets file");
            } else {
                $("#loading-indicator").hide();
            }
        });
    
        function changeViewFileDownload(filename, download_path = null) {
            $("#loading-indicator").hide();
            if (download_path && filename) {
                downloadURI(download_path, filename);
            }
            $("#download").text("\"" + filename + "\" has been saved to the cloud.");
        }
    
        function downloadURI(uri, filename) {
            var link = document.createElement("a");
            link.download = filename;
            link.href = uri;
            document.body.appendChild(link);
            link.click();
            // document.body.removeChild(link);
            // delete link;
        }
        socket.on('takeLangStat', function(jsonStr) {
            var jsonObj = jsonStr;
            var totalCount = 0;
            var lang_for_display_count = 0;
            var sortable = [];
            var othersCount = 0;
            var langusgesToDisplay = 15;
    
            var pie_chart_data = []
    
            for (var language_id in jsonObj) {
                if (language_id != '')
                    sortable.push({
                        language: language_id,
                        tweet_count: jsonObj[language_id]
                    });
            }
    
            sortable.sort(function(a, b) {
                return b.tweet_count - a.tweet_count
            });
            //console.log(JSON.stringify(sortable));
    
            if ($('div#lang_stats > div').length >= 1) {
                $("#lang_stats").empty();
            }
    
            if (jsonObj["English"] != 0) {
                for (var i = 0; langusgesToDisplay > 0; i++) {
                    if (sortable[i].language !== 'Unidentified') {
                        var newEle = '<div id=language_' + i + ' style="text-align: left; margin: 2px 0px; padding:3px; height:2em; width: 14em;border-bottom: 2px dotted lightgray;"><span><b> <font color="#060606">' + sortable[i].language + '</span></b><span class="badge" style="background-color: #2880c8;color:white;float:right;border-radius:6px">' + sortable[i].tweet_count + '</span></b></div>';
                        $("#lang_stats").append(newEle);
                        pie_chart_data.push({
                            name: sortable[i].language,
                            y: sortable[i].tweet_count
                        }) // For Pie Chart
                        if (sortable[i].language == 'English') {
                            $("#englishcount").text(sortable[i].tweet_count);
                        }
                        if (sortable[i].language == 'Spanish') {
                            $("#spanishcount").text(sortable[i].tweet_count);
                        }
                        lang_for_display_count += sortable[i].tweet_count;
                        langusgesToDisplay--;
                    }
                }
    
                for (var i = 0; i < sortable.length; i++) {
                    totalCount += sortable[i].tweet_count;
                }
    
                var newEle = '<div id=language_' + i + ' style="text-align: left; margin: 2px 0px; padding:3px; height:2em; width: 14em"><span><b><font color="#060606">Others</font></b></span><span class="badge" style="background-color: #2880c8;color:white;float:right">' + (totalCount - lang_for_display_count) + '</span></b></div>';
                $("#lang_stats").append(newEle);
    
                pie_chart_data.push({
                    name: "Others",
                    y: (totalCount - lang_for_display_count)
                }) // For Pie Chart
            }
    
        });
    
    
        function sourceDeviceChart() {
            var twts_src_chart = $('#twts_source').highcharts();
            var twts_src_keys = Object.keys(twts_src_dict);
            if (twts_src_keys.length !== 0) {
                var twts_src_data = [];
                twts_src_keys.forEach((val) => {
                    twts_src_data.push(twts_src_dict[val])
                })
                twts_src_chart.series[0].update({
                    data: twts_src_data
                }, false);
                twts_src_chart.redraw();
            }
            // allClientTimeouts.push(setTimeout(sourceDeviceChart, 2000))
    
        }
        // sourceDeviceChart()
        allClientIntervals.push(setInterval(sourceDeviceChart, 2000));
    
        Highcharts.chart('twts_source', {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: 'Source Device Details'
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        connectorColor: 'silver'
                    }
                }
            },
            series: [{
                name: 'percent',
                data: []
            }]
        });
    
        //Display lag between client and server.
        socket.on("total_tweets_at_server", function(count) {
            displayBufferedTweets(count);
            // displayBufferedTweets((count>tweetsCount)?count - tweetsCount:0);
            // twbuffercount = (count>tweetsCount)?count - tweetsCount:0;
            //console.log("buffer count calculation " + twbuffercount);
    
    
        });
        //socket.on("hightraffic", function(count){
        //TwBufferLimitreached = "Y";
        // bufferExceededTweetWrite();
        //});
        socket.on('showhashtag', function(count) {
            $("#hashtagtweets").text(count);
            tweets_dtls_for_donut['hashtagtweets'] = {
                "label": "Hashtag Tweets",
                "count": count
            };
        });
    
        socket.on('showmentioned', function(count) {
            $("#mentionedtweets").text(count);
            tweets_dtls_for_donut['mentionedtweets'] = {
                "label": "Mentioned Tweets",
                "count": count
            };
        });
    
        socket.on('takeTopKKeywords', function(jsonString) {
            if (jsonString.hasOwnProperty('children') && jsonString.children.length > 0)
                drawKeywordBubbles(jsonString);
        });
    
        socket.on('takeTopKHashtags', function(jsonString) {
            if (jsonString.hasOwnProperty('children') && jsonString.children.length > 0)
                drawHashTagBubbles(jsonString);
        });
    
        socket.on("takeTopKMostInfluentialUsers", function(jsonString) {
    
            if (jsonString.length > 0) { //100 is arbitrary choosen number.
                update_list_topK_user_with_max_followers(jsonString);
                delayTopKMostInfluentialUsers = FINAL_DELAY_TOP_K_MOST_INFLUENTIAL_USERS;
            }
        });
    
        socket.on("takeTopKMostActiveUsers", function(jsonString) {
            if (jsonString.length > 0) { //100 is arbitrary choosen number.
                update_list_topK_user_with_max_tweets(jsonString);
                delayTopKMostActiveUsers = FINAL_DELAY_TOP_K_MOST_ACTIVE_USERS;
            }
        });
    
        socket.on("takeTopKMostMentionedUsers", function(jsonString) {
            if (jsonString.length > 0) { //100 is arbitrary choosen number.
                update_list_topK_most_mentioned_users(jsonString);
                delayTopKMostMentionedUsers = FINAL_DELAY_TOP_K_MOST_MENTIONED_USERS;
            }
            socket.emit("getTopKMostMentionedUsers", "No Data!");
        });
    
        socket.on("takeTopKMaxReTweets", function(jsonString, keywordMap) {
    
            if (jsonString.length > 0) { //100 is arbitrary choosen number.
                update_list_topK_max_retweets(jsonString, keywordMap);
                delayTopKMaxReTweets = FINAL_DELAY_TOP_K_MAX_RETWEETS;
            }
        });
    
        socket.on("takeTopKInstaPhotos", function(jsonString) {
            if (jsonString.length > 15) { //100 is arbitrary choosen number.
                if (instagramFunction == 1) {
                    update_list_topK_insta_photos(jsonString);
                    delayTopKInstaPhotos = FINAL_DELAY_TOP_K_INSTA_PHOTOS;
                }
            }
        });
    
        socket.on("takeSentimentCount", function(sentiCount) {
            var jsonObj = sentiCount;
            $("#negSentCount").text(jsonObj["negSentCount"]);
            $("#posSentCount").text(jsonObj["posSentCount"]);
            $("#neutralSentCount").text(jsonObj["neutralSentCount"]);
            $("#totalsenticount").text(jsonObj["totalsenticount"]);
    
            tweets_dtls_for_donut['negSentCount'] = {
                "label": "Negative",
                "count": jsonObj["negSentCount"]
            };
            tweets_dtls_for_donut['posSentCount'] = {
                "label": "Positive",
                "count": jsonObj["posSentCount"]
            };
            tweets_dtls_for_donut['neutralSentCount'] = {
                "label": "Neutral",
                "count": jsonObj["neutralSentCount"]
            };
            tweets_dtls_for_donut['totalsenticount'] = {
                "label": "Total Sentiment",
                "count": jsonObj["totalsenticount"]
            };
        });
    
    
        socket.on("twitter_error", function(msg) {
            Example.show("TwitterAPI error,  auto reconnecting after 90 seconds :" + msg);
        });
    
        socket.on("apiwarning", function(warning) {
            Example.show("Twitter buffer full warning :" + warning.code + "  " + warning.percent_full);
        });
    
        socket.on("limitwarning", function(limit) {
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
    
    
        socket.on('keywordListChanged', function(jsonString) {
            update_google_trend(jsonString);
        });
    
    
        // socket.on("negSentCount", function(count){
        //     $("#negSentCount").text(count);
        // });
        //
        // socket.on("posSentCount", function(count){
        //     $("#posSentCount").text(count);
        // });
        function clearAllClientDelay(allClientTimeouts, allClientIntervals) {
            for (var i = 0; i < allClientTimeouts.length; i++) {
                clearTimeout(allClientTimeouts[i]);
            }
            for (var i = 0; i < allClientIntervals.length; i++) {
                clearInterval(allClientIntervals[i]);
            }
        }        
        $(window).on('beforeunload', function() {
            //     socket.emit("abort", "No Data!");
            //
            //     socket.emit("StopTracking", "NoDisconnect");
            //     socket.emit("getTopKeywordsFile", "SaveAll");
            //     socket.emit("getAllTweetsFile", "SaveAll");
            //     socket.emit("getTopKMostInfluentialUsersFile", "SaveAll");
            //     socket.emit("getTopKMostActiveUsersFile", "SaveAll");
            //     socket.emit("getTopKMaxReTweetsFile", "SaveAll");
            //     socket.emit("getPosTweetsFile", "SaveAll");
            //     socket.emit("getNegTweetsFile", "SaveAll");
            // socket.emit("getFullReTweetsFile", "SaveAll");
    
            socket.emit("StopTracking", "NoDisconnect");
            socket.emit("storeTopKeywords", "SaveAll");
            socket.emit("storeTopHashtags", "SaveAll");
            socket.emit("storeBufferedTweets", "SaveAll");
            socket.emit("storeBalanceLiveTweets", "SaveAll");
            socket.emit("storeTopKMostInfluentialUsers", "SaveAll");
            socket.emit("storeTopKMostActiveUsers", "SaveAll");
            socket.emit("storeTopKMaxReTweets", "SaveAll");
            socket.emit("storeFullReTweets", "SaveAll");
            socket.emit("storePosTweets", "SaveAll");
            socket.emit("storeNegTweets", "SaveAll");
            socket.emit("track_user_audit_log", tweetsCount);
            clearAllClientDelay(allClientTimeouts, allClientIntervals);
            socket.emit("abort", "No Data!");
    
        });
    
        function sendData() {
            var data = $("#keywords").val();
            keywordMap[data] = 1;
            keywordMapSize++;
            socket.emit("track", data);
        }
    
        function untrackData() {
            var data = $("#keywords").val();
            delete keywordMap[data];
            keywordMapSize--;
    
            socket.emit("untrack", data);
        }
    
        function stopData() {
            socket.emit("stopData", "No Data!");
        }
    
        function clearData() {
            $('#messages').empty();
        }        
        function logout() {
    
            bootbox.dialog({
                message: "Do you want to save all the files before you logout?",
                title: "Save Data to the cloud!",
                buttons: {
                    success: {
                        label: "Yes, Save it",
                        className: "btn-success",
                        callback: function() {
                            $("#loading-indicator").show();
                            try {
                                    socket.emit("track_user_audit_log", tweetsCount, 'LOGOUT');
                                // socket.emit("getTopKeywordsFile", "SaveAll");
                                // socket.emit("getAllTweetsFile", "SaveAll");
                                // Example.show("saving all tweets . please wait... Total tweets  " + tweetsCount);
                                // socket.emit("getTopKMostInfluentialUsersFile", "SaveAll");
                                // socket.emit("getTopKMostActiveUsersFile", "SaveAll");
                                // socket.emit("getTopKMaxReTweetsFile", "SaveAll");
                                // Example.show("saving all tweets . please wait... Total tweets  " + tweetsCount);
                                // socket.emit("getPosTweetsFile", "SaveAll");
                                // socket.emit("getNegTweetsFile", "SaveAll");
                                // socket.emit("getFullReTweetsFile", "SaveAll");
                                // Example.show("saved "+tweetsCount+" tweets successfully.");
    
    
                                Example.show("saving all tweets . please wait... Total tweets  " + tweetsCount);
                                // socket.emit("StopTracking", "NoDisconnect");
                                socket.emit("storeTopKeywords", "SaveAll");
                                socket.emit("storeTopHashtags", "SaveAll");
                                socket.emit("storeBufferedTweets", "SaveAll");
                                socket.emit("storeBalanceLiveTweets", "SaveAll");
                                socket.emit("storeTopKMostInfluentialUsers", "SaveAll");
                                socket.emit("storeTopKMostActiveUsers", "SaveAll");
                                socket.emit("storeTopKMaxReTweets", "SaveAll");
                                socket.emit("storeFullReTweets", "SaveAll");
                                socket.emit("storePosTweets", "SaveAll");
                                socket.emit("storeNegTweets", "SaveAll");
                                clearAllClientDelay(allClientTimeouts, allClientIntervals);
                                socket.emit("abort", "No Data!");
                                Example.show("saved " + tweetsCount + " tweets successfully.");
                            } catch (ex) {
                                bugsnagClient.notify(ex);
                                console.log("Found Error during logout", ex)
                                socket.emit("uiException", ex);
                            }
                        }
                    },
                    main: {
                        label: "No, just logout",
                        className: "btn-primary",
                        callback: function() {
                            $("#loading-indicator").show();
                            try {
                                socket.emit("track_user_audit_log", tweetsCount, 'LOGOUT');
                                clearAllClientDelay(allClientTimeouts, allClientIntervals);
                                socket.emit("abort", "No Data!");
                            } catch (ex) {
                                console.log("Found Error during logout", ex)
                                socket.emit("uiException", ex)
                            }
                        }
                    }
                }
            });
    
        }
        $scope.logout= logout;
    
        socket.on("doneSaveAll", function(data) {
    
            if (typeof(saveAllFilesTracker[data]) == "undefined" || saveAllFilesTracker[data] == "") {
                saveAllFilesTracker[data] = true;
            } else {
                saveAllFilesTracker = new Object();
            }
    
            var count = Object.size(saveAllFilesTracker);
            if (count === 8) {
                $("#download").text("All files have been saved to the cloud.");
                clearAllClientDelay(allClientTimeouts, allClientIntervals);
                socket.emit("abort", "No Data!");
            }
        });
    
        Object.size = function(obj) {
            var size = 0,
                key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) size++;
            }
            return size;
        };

        function auditLog() {
            if (tweetsCount > 0) {
                socket.emit("track_user_audit_log", tweetsCount);
            }
        }
        allClientIntervals.push(setInterval(auditLog, 2000));
    
        // Get the size of an object
        //var size = Object.size(myArray);
    
        function updateWordCloud() {
            socket.emit("getTopKKeywordsAndHashTags", "No Data!");
        }
    
        function updateTopKMostInfluentialUsers() {
            socket.emit("getTopKMostInfluentialUsers", "No Data!");
            // allClientTimeouts.push(setTimeout(updateTopKMostInfluentialUsers, delayTopKMostInfluentialUsers));
        }
    
        function updateTopKMostActiveUsers() {
            socket.emit("getTopKMostActiveUsers", "No Data!");
            // allClientTimeouts.push(setTimeout(updateTopKMostActiveUsers, delayTopKMostActiveUsers));
        }
    
        function updateTopKMostMentionedUsers() {
            socket.emit("getTopKMostMentionedUsers", "No Data!");
            // allClientTimeouts.push(setTimeout(updateTopKMostMentionedUsers, delayTopKMostMentionedUsers));
        }
    
        function updateTopKMaxReTweets() {
            socket.emit("getTopKMaxReTweets", "No Data!");
            // allClientTimeouts.push(setTimeout(updateTopKMaxReTweets, delayTopKMaxReTweets));
        }
    
        function updateTopKInstaPhotos() {
            if (instagramFunction == 1) {
                socket.emit("getTopKInstaPhotos", "No Data!");
            }
            // setTimeout(updateTopKInstaPhotos, delayTopKInstaPhotos);
        }
    
        function updateSentimentCount() {
            socket.emit("getSentimentCount", "No Data!");
            // setTimeout(updateSentimentCount, initialDelaySentimentCount);
        }
    
        function updateLangStat() {
            socket.emit("getLangStat", "No Data!");
            // setTimeout(updateLangStat, delayLangStat);
        }
    
    
        function checkForMaxLimit() {
            if (tweetsCount >= MAX_LIMIT) {
                limitreached = "Y";
                maxcounter++;
                console.log("counter at max limit  " + maxcounter);
                if (maxcounter > 1) {
                    clearAllClientDelay(allClientTimeouts, allClientIntervals);
                    socket.emit("abort", "No Data!");
                }
                if (limitreached === "Y" && maxcounter === 1) {
                    Example.show("Saving files...Max limit reached at : " + tweetsCount);
                    console.log("Maximum limit reached at   " + tweetsCount + " maxcounter = " + maxcounter);
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
            // setTimeout(checkForMaxLimit, DELAY_CHECK_FOR_MAX_LIMIT);
        }
    
        var BASIC_LICENSE_TYPE_TWEET_LIMIT = null;
        socket.on("basic_license_tweet_limit", function(basicLicenseLimit) {
            BASIC_LICENSE_TYPE_TWEET_LIMIT = basicLicenseLimit;
        });
    
        function checkForBasicUserLimit() {
            if (BASIC_LICENSE_TYPE_TWEET_LIMIT && (tweetsCount >= MAX_LIMIT || tweetsCount >= BASIC_LICENSE_TYPE_TWEET_LIMIT)) {                
                var msg = "Tweets Limits has been Exceeded. Please purchase enterprise license type.Do you want to save all the files before you logout?"
                bootbox.dialog({
                    message: msg,
                    title: "Limit Exceeded!!!",
                    buttons: {
                        success: {
                            label: "Yes, Save it",
                            className: "btn-success",
                            callback: function() {
                                $("#loading-indicator").show();
                                try {
                                    //          socket.emit("StopTracking", "NoDisconnect");
                                    //          socket.emit("getTopKeywordsFile", "SaveAll");
                                    //          socket.emit("getAllTweetsFile", "SaveAll");
                                    // Example.show("saving all tweets . please wait... Total tweets  " + tweetsCount);
                                    //          socket.emit("getTopKMostInfluentialUsersFile", "SaveAll");
                                    //          socket.emit("getTopKMostActiveUsersFile", "SaveAll");
                                    //          socket.emit("getTopKMaxReTweetsFile", "SaveAll");
                                    // Example.show("saving all tweets . please wait... Total tweets  " + tweetsCount);
                                    //          socket.emit("getPosTweetsFile", "SaveAll");
                                    //          socket.emit("getNegTweetsFile", "SaveAll");
                                    // socket.emit("getFullReTweetsFile", "SaveAll");
    
                                    Example.show("saving all tweets . please wait... Total tweets  " + tweetsCount);
                                    socket.emit("StopTracking", "NoDisconnect");
                                    socket.emit("storeTopKeywords", "SaveAll");
                                    socket.emit("storeTopHashtags", "SaveAll");
                                    socket.emit("storeBufferedTweets", "SaveAll");
                                    socket.emit("storeBalanceLiveTweets", "SaveAll");
                                    socket.emit("storeTopKMostInfluentialUsers", "SaveAll");
                                    socket.emit("storeTopKMostActiveUsers", "SaveAll");
                                    socket.emit("storeTopKMaxReTweets", "SaveAll");
                                    socket.emit("storeFullReTweets", "SaveAll");
                                    socket.emit("storePosTweets", "SaveAll");
                                    socket.emit("storeNegTweets", "SaveAll");
                                    clearAllClientDelay(allClientTimeouts, allClientIntervals);
                                    socket.emit("abort", "No Data!");
                                    Example.show("saved " + tweetsCount + " tweets successfully.");
                                } catch (ex) {
                                    bugsnagClient.notify(ex);
                                    console.log("FOund Error during logout", ex)
                                    socket.emit("uiException", ex)
                                }
    
    
                            }
                        },
                        main: {
                            label: "No, just logout",
                            className: "btn-primary",
                            callback: function() {
                                try {
                                    clearAllClientDelay(allClientTimeouts, allClientIntervals);
                                    socket.emit("abort", "No Data!");
                                } catch (ex) {
                                    bugsnagClient.notify(ex);
                                    console.log("FOund Error during logout", ex)
                                    socket.emit("uiException", ex)
                                }
    
                            }
                        }
                    }
                });
                clearAll();
                clearInterval(tweetsLimitsInterval);
            }
            // setTimeout(checkForBasicUserLimit, DELAY_CHECK_FOR_MAX_LIMIT);
        }
    
        function bufferExceededTweetWrite() {
            //if (BufferMaxProcessed  == 0){
            if (BufferMaxProcessed > 1) {
                clearAllClientDelay(allClientTimeouts, allClientIntervals);
                socket.emit("abort", "No Data!");
            }
            if (TwBufferLimitreached === "Y" && twBufferMaxcounter === 1) {
                Example.show("Server traffic exceeded..  saving files.. buffer =    " + twbuffercount);
                socket.emit("StopTracking", "NoDisconnect");
                socket.emit("getTopKeywordsFile", "SaveAll");
                socket.emit("getAllTweetsFile", "SaveAll");
                socket.emit("getTopKMostInfluentialUsersFile", "SaveAll");
                socket.emit("getTopKMostActiveUsersFile", "SaveAll");
                socket.emit("getTopKMaxReTweetsFile", "SaveAll");
                socket.emit("getPosTweetsFile", "SaveAll");
                socket.emit("getNegTweetsFile", "SaveAll");
                socket.emit("getFullReTweetsFile", "SaveAll");
                socket.emit('servertraffic', twbuffercount);
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
            if (tweetwritemaxcounter === 1) {
                tweetwritemaxcounter = 0;
            }
        }
        let OnLoadTriggerInterval = setInterval(OnLoadTrigger, 50);
        var tweetsLimitsInterval = null;
        function OnLoadTrigger() {
            if (tweetsCount > 0) {
                allClientIntervals.push(setInterval(updateWordCloud, WORD_CLOUD_REFRESH_DELAY));
                allClientIntervals.push(setInterval(updateTopKMostInfluentialUsers, delayTopKMostInfluentialUsers));
                allClientIntervals.push(setInterval(updateTopKMostActiveUsers, delayTopKMostActiveUsers));
                // allClientIntervals.push(setInterval(updateTopKMostMentionedUsers, delayTopKMostMentionedUsers));
                updateTopKMostMentionedUsers();
                allClientIntervals.push(setInterval(updateTopKMaxReTweets, delayTopKMaxReTweets));
                // allClientIntervals.push(setInterval(updateTopKInstaPhotos, delayTopKInstaPhotos));
                allClientIntervals.push(setInterval(updateSentimentCount, initialDelaySentimentCount));
                allClientIntervals.push(setInterval(updateLangStat, delayLangStat));
                allClientIntervals.push(setInterval(checkForMaxLimit, DELAY_CHECK_FOR_MAX_LIMIT));
                allClientIntervals.push(setInterval(checkForBasicUserLimit, DELAY_CHECK_FOR_MAX_LIMIT));
                // tweetsLimitsInterval = setInterval(checkForBasicUserLimit, DELAY_CHECK_FOR_MAX_LIMIT);
                checkforTweetWrite();
                bufferExceededTweetWrite();
    
    
                // updateTopKMostInfluentialUsers();
                // updateTopKMostActiveUsers();
                // updateTopKMostMentionedUsers();
                // updateTopKMaxReTweets();
                // updateTopKInstaPhotos();
                // updateSentimentCount();
                // updateLangStat();
                // checkForMaxLimit();
                // checkForBasicUserLimit();
                // checkforTweetWrite();
                // bufferExceededTweetWrite();          
                clearInterval(OnLoadTriggerInterval);
            }
        }
    
        function resetGUI() {
            d3.select("#wordcloud").selectAll("svg").remove();
            d3.select("#hashtag_wordcloud").selectAll("svg").remove();
            removeAllTask();
    
            tweetsCount = 0;
            reTweetsCount = 0;
            displayGlobalFlag = 0;
    
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
            $("#sortable").empty()
            $("#max_followers_ul").empty();
            $("#max_tweets_ul").empty();
            $("#most_mentioned_ul").empty();
            $("#retweets_window").empty();
            $("#insta_photos_window").empty();
            $("#main").html("");
            $("#lang_stats").empty();
            clock.stop(); //FlipClock commment
            clock.setTime(0); //FlipClock comment
            // clearTimer();
            startTimerCustomTrackFlag = 0;
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
            for (index = 0; index < langs_for_display.length; index++) {
                $("#" + langs_for_display[index]).text(0);
            }
            $("#ot").text(0);
    
        }
    
        //Track terms GUI
        //$("#sortable").sortable();
        //$("#sortable").disableSelection();
    
        countTodos();
    
        // all done btn
        $("#checkAll").click(function() {
            AllDone();
        });
    
        //create todo
        $('.add-todo').on('keypress', function(e) {
    
            e.preventDefault
            if (e.which == 13) {
                customSearch();
            }
        });
        //Start: Custom Search Bar
        function customSearchFileSelect(evt) {
            var files = evt.target.files; // FileList object
    
            // Loop through the FileList and render image files as thumbnails.
            for (var i = 0, f; f = files[i]; i++) {
    
                // Only process image files.
                if (!(f.type.match('text.*') || f.type.match('application.*'))) {
                    Example.show("Selected Invalid File type..Only Text/Excel/Csv file types are supported!");
                    continue;
                }
                var reader = new FileReader();
    
                // Closure to capture the file information.
                reader.onload = (function(theFile) {
                    return function(e) {
                        let inputKeywordValue = $('#inputkeyword').val();
                        let uploadedText = e.target.result.split(/\n|,/).join(',');
                        let comma = (inputKeywordValue.endsWith(",") || uploadedText.startsWith(",") || inputKeywordValue.length === 0) ? "" : ",";
                        $('#inputkeyword').val(`${inputKeywordValue}${comma}${uploadedText}`);
                    };
                })(f);
                reader.readAsText(f);
            }
        }
    
        document.getElementById('customSearchFiles1').addEventListener('change', customSearchFileSelect, false);
    
        $('#uploadBtn').click(function() {
            $('#customSearchFiles2').first().trigger("click");
        });
    
        $('#customSearchFiles2').first().change(function(event) {
            event.preventDefault();
            customSearchFileSelect(event);
        });
    
        $(".custom-select").each(function() {
            var classes = $(this).attr("class"),
                id = $(this).attr("id"),
                name = $(this).attr("name");
            var template = '<div class="' + classes + '">';
            template += '<span class="custom-select-trigger">' + $(this).attr("placeholder") + '</span>';
            template += '<div class="custom-options">';
            $(this).find("option").each(function() {
                var option_id = $(this).attr("id");
                template += '<option id="' + option_id + '" class="custom-option ' + $(this).attr("class") + '" data-value="' + $(this).attr("value") + '">' + $(this).html() + '</option>';
                $(this).removeAttr("id");
            });
            template += '</div></div>';
    
            $(this).wrap('<div class="custom-select-wrapper"></div>');
            $(this).hide();
            $(this).after(template);
        });
    
        $(".custom-option:first-of-type").hover(function() {
            $(this).parents(".custom-options").addClass("option-hover");
        }, function() {
            $(this).parents(".custom-options").removeClass("option-hover");
        });
        $(".custom-select-trigger").on("click", function() {
            $('html').one('click', function() {
                $(".custom-select").removeClass("opened");
            });
            $(this).parents(".custom-select").toggleClass("opened");
            event.stopPropagation();
        });
        $(".custom-option").on("click", function() {
            $(this).parents(".custom-select-wrapper").find("select").val($(this).data("value"));
            $(this).parents(".custom-options").find(".custom-option").removeClass("selection");
            $(this).addClass("selection");
            $(this).parents(".custom-select").removeClass("opened");
            $(this).parents(".custom-select").find(".custom-select-trigger").text($(this).text());
        });
    
        function searcBarEnable(isEnabled) {
            $("#inputkeyword").attr("disabled", isEnabled);
            $("#iconInputSearch").attr("disabled", isEnabled);
            $("#customSearchFiles").attr("disabled", isEnabled);
            $(".custom-search").attr("disabled", isEnabled);
            $("#uploadBtn").attr("disabled", isEnabled);
            $("#customSearchFiles2").attr("disabled", isEnabled);
        }
    
        function customSearch() {
            if ($('#inputkeyword').val() != '') {
                var keyList = $('#inputkeyword').val().split(',');
                let totalKeysCnt = keyList.length + Object.keys(keywordMap).length;
                if (totalKeysCnt <= CUSTOM_KEYWORD_LIMITS) {                
                    for (let i = 0; i < keyList.length; i++) {
                        // var todo = $(this).val();
                        var custKey = keyList[i].replace(/\s+/g, ' ').trim();
                        if (custKey.replace(/\s+/g, '').trim().length > 30) {
                            Example.show("Each search key will be allowed only 30 characters..");
                            break
                        }
                        if (keywordMap[custKey] === undefined) {
                            if (custKey.length > 0) {
                                startTwtDelay = new Date();
                                createTodo(custKey, keyList);
                                countTodos();
                            }
                        } else {
                            Example.show("Duplicate search keys are not allowed.Verify the current key being in search list already..");
                        }
                    }
                } else {
                    Example.show(`Twitterplay allows only ${CUSTOM_KEYWORD_LIMITS} keywords. please remove excessive keywords..`);
                }
            } else {
                Example.show("No Keyword inputs available to search..");
            }
        }
        $scope.customSearch = customSearch;
    
        //End: Custom Search Bar
    
        //delete done task from "already done"
        $('.todolist').on('click', '.remove-item', function() {
            removeItem(this);
            //alert("Untrack: "+$(this).parent().text());
            var text = $(this).parent().text();
            delete keywordMap[text];
            keywordMapSize--;
            socket.emit("untrack", text);
        });
    
        function removeKeywords() {
            let [$evt, text] = arguments;
            let _self = $evt.target;
            removeItem(_self);
            //alert("Untrack: "+$(this).parent().text());
            // var text = $(this).parent().text();
            delete keywordMap[text];
            keywordMapSize--;
            socket.emit("untrack", text);
    
        }
        $scope.removeKeywords = removeKeywords;
        // count tasks
        function countTodos() {
            var count = $("#sortable li").length;
            $('.count-todos').html(count);
        }
    
        //create task
        $('.add-todo').focus();
    
        function createTodo(text, keyList) {
            if (startTimerCustomTrackFlag == 0) {
                clock.setTime(0); //FilpClock comment
                clock.start(); //FilpClock comment
                //clearTimer();
                //startTimer();
                startTimerCustomTrackFlag = 1;
            }
            //var markup = '<li class="ui-state-default"><div class="checkbox"><label><input type="checkbox" value="" />'+ text +'</label></div></li>';
            //var markup = '<li class="ui-state-default"><div class="checkbox">'+ text +'<button class="btn btn-default btn-xs pull-right  remove-item"><span class="glyphicon glyphicon-remove"></span></button></div></li>';
            keywordMap[text] = 1;
            keywordMapSize++;
            // var markup = '<li>'+ text +'<button class="btn btn-default btn-xs pull-right remove-item "></button></li>';
            // var markup = `<li>${text}<button class="btn btn-default btn-xs pull-right  remove-item" id="removeKeywords"><span class="glyphicon glyphicon-remove"></span></button></li>`;
            var markup = `<div class="chip" tabindex="0">${text}<span class="badge" id="${text}" style="background-color: #ffffff;color: black;margin-left: 2px;padding: 1px 6px;">0</span><i class="fa fa-times close" ng-click="removeKeywords($event,'${text}')" aria-hidden="true"></i></div>`;
            // var markup = `<li>${text}<button class="btn btn-default btn-xs pull-right  remove-item" onclick=removeKeywords(this,'${text}')><span class="glyphicon glyphicon-remove"></span></button></li>`;
            
            let sortElm= $('#sortable');
            sortElm.prepend(markup);

            $compile( sortElm.contents() )( $scope );
            
            // $('#sortable').prepend(markup);
            $('.add-todo').val('');
            $('.add-todo').focus();
            localStorage.setItem('custom_keys', text)
            socket.emit("track", text, keyList);
    
        }
    
    
        function removeAllTask() {
            $('#sortable li').remove();
        }
    
        //mark all tasks as done
        function AllDone() {
            var myArray = [];
    
            $('#sortable li').each(function() {
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
        function removeItem(element) {
            $(element).parent().remove();
        }
    
        //Google MAP code
        var sub_id = Math.floor((Math.random() * 9999999999) + 1);
        var markers = [];
        var markerCount = 0;
        var map;
    
        function initialize() {
    
            // var myLatlng = new google.maps.LatLng(20, -10);
            // var mapOptions = {
            //     zoom: 2,
            //     center: myLatlng,
            //     mapTypeId: google.maps.MapTypeId.ROADMAP
            // }
    
            // map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
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
        // function addMarkerToMap(latitude, longitude, text, img_url, name, screen_name, location) {
        //     var infowindow = new google.maps.InfoWindow();
        //     var myLatLng = new google.maps.LatLng(latitude, longitude);
        //     var marker = new google.maps.Marker({
        //         position: myLatLng,
        //         map: map,
        //         animation: google.maps.Animation.DROP,
        //     });
    
        //     //Gives each marker an Id for the on click
        //     markers.push(marker);
        //     markerCount++;
        //     // google.maps.event.addListener(marker, "click", function() {
        //     //	marker.setMap(map);
        //     // });
        //     var m = 0;
        //     //Creates the event listener for clicking the marker
        //     //and places the marker on the map
        //     google.maps.event.addListener(marker, 'mouseover', (function(marker, markerCount) {
        //         return function() {
        //             var htmlContent = '<div id=ele' + m + ' style="text-align: left; margin: 25px 0px; padding:1px; height:4em; background:pink;"><div style="float: left; margin: 0px 10px 3px 0px;"><img src=' + img_url + ' height=55 width=55></img></div><span><b>' + name + '</b>' + ' @' + screen_name + '</br>' + text + '</span></div>';
        //             m++;
        //             infowindow.setContent(htmlContent);
        //             infowindow.open(map, marker);
    
        //         }
        //     })(marker, markerCount));
    
        //     google.maps.event.addListener(marker, 'mouseout', (function(marker, markerCount) {
        //         return function() {
        //             infowindow.close();
    
        //         }
        //     })(marker, markerCount));
    
        //     //Pans map to the new location of the marker
        //     //map.panTo(myLatLng)
        // }
    
        function DeleteMarkers() {
            //Loop through all the markers and remove
            for (var k = 0; k < markers.length; k++) {
                markers[k].setMap(null);
            }
            markers = [];
        };
        var keywordMatchCount = {};   
    
        function custom_key_counter(tweet, custom_keywords) {
            var keywordMapKeys = Object.keys(custom_keywords)
            keywordMapKeys.forEach(function(val, key) {
                var matchKey = tweet.match(new RegExp(val, "gi"));
                if (matchKey && matchKey.length > 0) {
                    var keyMatchCount = parseInt($(`[id="${val}"]`).text()) + 1;
                    // $("#" + val).text(keyMatchCount);
                    $(`[id="${val}"]`).text(keyMatchCount);
                    keywordMatchCount[val] = keyMatchCount;
                }
            });
        }
        function vaidateTwtsDelay() {
            var keyList = $('#inputkeyword').val().split(',');
            if (startTwtDelay && keyList.length> 0) {
                let endTwtDelay = new Date();
                var twtsDelayInMnts = (parseInt(endTwtDelay.getMinutes()) - parseInt(startTwtDelay.getMinutes()));
                if (twtsDelayInMnts >= startTwtDelayTime) {
                    startTwtDelayTime= 2;
                    Example.show("waiting for live tweets to match the search criteria...please wait..");
                }
            }
            // allTimeouts.push(setTimeout(vaidateTwtsDelay, 0));
        }
        allClientIntervals.push(setInterval(vaidateTwtsDelay, 500)); //If no tweets processed for 5 min for the keywords then show "waiting for the tweets" in snackbar for every 5 minutes...Every five minutes should be calculated of last processed tweets
        
        function keepadd(text, img_url, name, screen_name, location, custom_keywords) {
            custom_key_counter(text, custom_keywords)
            startTwtDelay = new Date();
            if (location !== '' && location !== null) {
                locationcount++;
                $('#locationcount').text(locationcount);
                tweets_dtls_for_donut['locationcount'] = {
                    "label": "Twts with Profile location",
                    "count": gpscount
                };
            }
            // img_url = "/static/images/default_pink.png";
            text = (typeof(custom_keywords)) ? mixin.tweetsHighlight(text, Object.keys(custom_keywords)) : text;
            text = mixin.urlify(text)
            var user_account_url = "https://twitter.com/" + screen_name;
            if (indexAdd == 0) {
                if (location !== '' && location !== null)
                    $('#main').prepend('<div class="well well-lg col-xs-12 alternative_bg tweet-card" id=ele' + indexAdd + ' style="padding:8px;margin-bottom: 10px"><div style="float: left;margin: 0px 5px 3px 0px;width: 7%;"><a id="live_tweets_a_' + indexAdd + '" href="' + user_account_url + '" class="img-thumbnail img-responsive img-rounded" target="_blank"><img src=' + img_url + ' height=40 width=40></img></a></div><span style="width: 92%;color:#1565C0"><span style="font-weight: bold;">' + name + '</span>' + ' @' + screen_name + '  ' + '<img src="/static/images/location2.png" height="auto" width="auto" style="margin-left:10px"></img>' + '<font color="#0099CC"> ' + location + '</font>' + '</br>' + ' <font color="#060606">' + text + '</span></div>');
                else
                    $('#main').prepend('<div class="well well-lg col-xs-12 alternative_bg tweet-card" id=ele' + indexAdd + ' style="padding:8px;margin-bottom: 10px"><div style="float: left;margin: 0px 5px 3px 0px;width: 7%;"><a id="live_tweets_a_' + indexAdd + '" href="' + user_account_url + '" class="img-thumbnail img-responsive img-rounded" target="_blank"><img src=' + img_url + ' height=40 width=40></img></a></div><span style="width: 92%;color:#1565C0"><span style="font-weight: bold;">' + name + '</span>' + ' @' + screen_name + '  ' + '<img src="/static/images/location2.png" height="auto" width="auto" style="margin-left:10px"></img>' + '<font color="#FF6600"> Not available </font>' + '</br>' + ' <font color="#060606">' + text + '</span></div>');
            } else {
                if (location !== '' && location !== null)
                    $('#main').prepend('<div class="well well-lg col-xs-12 alternative_bg tweet-card" id=ele' + indexAdd + ' style="padding:8px;margin-bottom: 10px"><div style="float: left;margin: 0px 5px 3px 0px;width: 7%;"><a id="live_tweets_a_' + indexAdd + '" href="' + user_account_url + '" class="img-thumbnail img-responsive img-rounded" target="_blank"><img src=' + img_url + ' height=40 width=40></img></a></div><span style="width: 92%;color:#1565C0"><span style="font-weight: bold;">' + name + '</span>' + ' @' + screen_name + '  ' + '<img src="/static/images/location2.png" height="auto" width="auto" style="margin-left:10px"></img>' + '<font color="#0099CC"> ' + location + '</font>' + '</br>' + ' <font color="#060606">' + text + '</span></div>');
                else
                    $('#main').prepend('<div class="well well-lg col-xs-12 alternative_bg tweet-card" id=ele' + indexAdd + ' style="padding:8px;margin-bottom: 10px"><div style="float: left;margin: 0px 5px 3px 0px;width: 7%;"><a id="live_tweets_a_' + indexAdd + '" href="' + user_account_url + '" class="img-thumbnail img-responsive img-rounded" target="_blank"><img src=' + img_url + ' height=40 width=40></img></a></div><span style="width: 92%;color:#1565C0"><span style="font-weight: bold;">' + name + '</span>' + ' @' + screen_name + '  ' + '<img src="/static/images/location2.png" height="auto" width="auto" style="margin-left:10px"></img>' + '<font color="#FF6600"> Not available </font>' + '</br>' + ' <font color="#060606">' + text + '</span></div>');
    
                if (indexAdd > 25) {
                    var name = "ele" + indexRemove;
                    indexRemove++;
                    var remele = document.getElementById(name);
                    main.removeChild(remele);
                }
            }
            indexAdd++;
            //have a counter i - append i with name of element as ele1 or ele2. Remove ele+i when j exceeds 8
        }
    
    
        function keepaddNeg(text, img_url, name, screen_name, location) {
            if (indexAddNeg == 0) {
                if (location !== '' && location !== null)
                    $('#mainNeg').prepend('<div class="well alternative_bg" id=eleNeg' + indexAddNeg + ' style=" margin-bottom: 10px; padding:8px;"><div style="float: left; width: 6%;"><img src=' + img_url + ' height=35 width=35></img></div><span style="width: 92%;color:#1565C0"><b>' + '<font color="#0099CC"> ' + name + '</b>' + ' @' + screen_name + '  ' + '<img src="/static/images/location2.png" height="auto" width="auto"></img>' + '<font color="#0099CC"> ' + location + '</font>' + '</br>' + ' <font color="#060606">' + text + '</span></div>');
                else
                    $('#mainNeg').prepend('<div class="well alternative_bg" id=eleNeg' + indexAddNeg + ' style="margin-bottom: 10px; padding:8px;"><div style="float: left; width: 6%;"><img src=' + img_url + ' height=35 width=35></img></div><span style="width: 92%;color:#1565C0"><b>' + '<font color="#0099CC"> ' + name + '</b>' + ' @' + screen_name + '  ' + '<img src="/static/images/location2.png" height="auto" width="auto"></img>' + '<font color="#FF6600"> Not available </font>' + '</br>' + ' <font color="#060606">' + text + '</span></div>');
            } else {
                if (location !== '' && location !== null)
                    $('#mainNeg').prepend('<div class="well alternative_bg" id=eleNeg' + indexAddNeg + ' style=" margin-bottom: 10px; padding:8px;"><div style="float: left; width: 6%;"><img src=' + img_url + ' height=35 width=35></img></div><span style="width: 92%;color:#1565C0"><b>' + '<font color="#0099CC"> ' + name + '</b>' + ' @' + screen_name + '  ' + '<img src="/static/images/location2.png" height="auto" width="auto"></img>' + '<font color="#0099CC"> ' + location + '</font>' + '</br>' + ' <font color="#060606">' + text + '</span></div>');
                else
                    $('#mainNeg').prepend('<div class="well alternative_bg" id=eleNeg' + indexAddNeg + ' style="margin-bottom: 10px; padding:8px;"><div style="float: left; width: 6%;"><img src=' + img_url + ' height=35 width=35></img></div><span style="width: 92%;color:#1565C0"><b>' + '<font color="#0099CC"> ' + name + '</b>' + ' @' + screen_name + '  ' + '<img src="/static/images/location2.png" height="auto" width="auto"></img>' + '<font color="#FF6600"> Not available </font>' + '</br>' + ' <font color="#060606">' + text + '</span></div>');
                if (indexAddNeg > 7) {
                    var name = "eleNeg" + indexRemoveNeg;
                    indexRemoveNeg++;
                    var remele = document.getElementById(name);
                    mainNeg.removeChild(remele);
                }
            }
            indexAddNeg++;
            var mainNeg_window = $('#mainNeg')
            mainNeg_window.scrollTop(mainNeg_window.get(0).scrollHeight);
        }
    
        function keepaddPos(text, img_url, name, screen_name, location) {
            if (indexAddPos == 0) {
                if (location !== '' && location !== null)
                    $('#mainPos').prepend('<div class="well alternative_bg" id=elePos' + indexAddPos + ' style="margin-bottom: 10px; padding:8px;"><div style="float: left; width: 6%;"><img src=' + img_url + ' height=35 width=35></img></div><span style="width: 92%;color:#1565C0"><b>' + name + '</b>' + ' @' + screen_name + '  ' + '<img src="/static/images/location2.png" height="auto" width="auto"></img>' + '<font color="#0099CC"> ' + location + '</font>' + '</br>' + ' <font color="#060606">' + text + '</span></div>');
                else
                    $('#mainPos').prepend('<div class="well alternative_bg" id=elePos' + indexAddPos + ' style="margin-bottom: 10px; padding:8px;"><div style="float: left; width: 6%;"><img src=' + img_url + ' height=35 width=35></img></div><span style="width: 92%;color:#1565C0"><b>' + name + '</b>' + ' @' + screen_name + '  ' + '<img src="/static/images/location2.png" height="auto" width="auto"></img>' + '<font color="#FF6600"> Not available </font>' + '</br>' + ' <font color="#060606">' + text + '</span></div>');
            } else {
                if (location !== '' && location !== null)
                    $('#mainPos').prepend('<div class="well alternative_bg" id=elePos' + indexAddPos + ' style="margin-bottom: 10px; padding:8px;"><div style="float: left; width: 6%;"><img src=' + img_url + ' height=35 width=35></img></div><span style="width: 92%;color:#1565C0"><b>' + name + '</b>' + ' @' + screen_name + '  ' + '<img src="/static/images/location2.png" height="auto" width="auto"></img>' + '<font color="#0099CC"> ' + location + '</font>' + '</br>' + ' <font color="#060606">' + text + '</span></div>');
                else
                    $('#mainPos').prepend('<div class="well alternative_bg" id=elePos' + indexAddPos + ' style="margin-bottom: 10px; padding:8px;"><div style="float: left; width: 6%;"><img src=' + img_url + ' height=35 width=35></img></div><span style="width: 92%;color:#1565C0"><b>' + name + '</b>' + ' @' + screen_name + '  ' + '<img src="/static/images/location2.png" height="auto" width="auto"></img>' + '<font color="#FF6600"> Not available </font>' + '</br>' + ' <font color="#060606">' + text + '</span></div>');
                if (indexAddPos > 7) {
                    var name = "elePos" + indexRemovePos;
                    indexRemovePos++;
                    var remele = document.getElementById(name);
                    mainPos.removeChild(remele);
                }
            }
            indexAddPos++;
            var mainPos_window = $('#mainPos')
            mainPos_window.scrollTop(mainPos_window.get(0).scrollHeight);
        }
    
        function keepaddNeutral(text, img_url, name, screen_name, location) {
            if (indexAddNeutral == 0) {
                if (location !== '' && location !== null)
                    $('#mainNeutral').prepend('<div class="well alternative_bg" id=eleNeutral' + indexAddNeutral + ' style="margin-bottom: 10px; padding:8px;"><div style="float: left; width: 6%;"><img src=' + img_url + ' height=35 width=35></img></div><span style="width: 92%;color:#1565C0"><b>' + name + '</b>' + ' @' + screen_name + '  ' + '<img src="/static/images/location2.png" height="auto" width="auto"></img>' + '<font color="#0099CC"> ' + location + '</font>' + '</br>' + ' <font color="#060606">' + text + '</span></div>');
                else
                    $('#mainNeutral').prepend('<div class="well alternative_bg" id=eleNeutral' + indexAddNeutral + ' style="margin-bottom: 10px; padding:8px;"><div style="float: left; width: 6%;"><img src=' + img_url + ' height=35 width=35></img></div><span style="width: 92%;color:#1565C0"><b>' + name + '</b>' + ' @' + screen_name + '  ' + '<img src="/static/images/location2.png" height="auto" width="auto"></img>' + '<font color="#FF6600"> Not available </font>' + '</br>' + ' <font color="#060606">' + text + '</span></div>');
            } else {
                if (location !== '' && location !== null)
                    $('#mainNeutral').prepend('<div class="well alternative_bg" id=eleNeutral' + indexAddNeutral + ' style="margin-bottom: 10px; padding:8px;"><div style="float: left; width: 6%;"><img src=' + img_url + ' height=35 width=35></img></div><span style="width: 92%;color:#1565C0"><b>' + name + '</b>' + ' @' + screen_name + '  ' + '<img src="/static/images/location2.png" height="auto" width="auto"></img>' + '<font color="#0099CC"> ' + location + '</font>' + '</br>' + ' <font color="#060606">' + text + '</span></div>');
                else
                    $('#mainNeutral').prepend('<div class="well alternative_bg" id=eleNeutral' + indexAddNeutral + ' style="margin-bottom: 10px; padding:8px;"><div style="float: left; width: 6%;"><img src=' + img_url + ' height=35 width=35></img></div><span style="width: 92%;color:#1565C0"><b>' + name + '</b>' + ' @' + screen_name + '  ' + '<img src="/static/images/location2.png" height="auto" width="auto"></img>' + '<font color="#FF6600"> Not available </font>' + '</br>' + ' <font color="#060606">' + text + '</span></div>');
                if (indexAddNeutral > 7) {
                    var name = "eleNeutral" + indexRemoveNeutral;
                    indexRemoveNeutral++;
                    var remele = document.getElementById(name);
                    mainNeutral.removeChild(remele);
                }
            }
            indexAddNeutral++;
            var mainNeutral_window = $('#mainNeutral')
            mainNeutral_window.scrollTop(mainNeutral_window.get(0).scrollHeight);
        }
        var keywords_cloud_tweets = null;
    
        function showKeywordTweetsFromBubble(element, evt, name) {
            if (keywords_cloud_tweets) {
                socket.emit('keyword_cloud_tweets', keywords_cloud_tweets, name);
            }
        }
        socket.on('keyword_cloud_processed', function(msg) {
            window.open(protocol + '://' + node_machine + "/keywordCloud");
        })
    
        function drawKeywordBubbles(jsonString) {
            var jsonObject = jsonString;
            keywords_cloud_tweets = jsonObject;
            // Highcharts.seriesTypes.wordcloud.prototype.deriveFontSize = function (relativeWeight) {
            //    var maxFontSize = 125;
            //   // Will return a fontSize between 0px and 25px.
            //   return Math.floor(maxFontSize * relativeWeight);
            // };
    
            // var word_cloud_chart = $('#wordcloud').highcharts();
            // word_cloud_chart.series[0].update({
            //   data: jsonObject.children
            // }, false);
            // word_cloud_chart.redraw();
    
            Highcharts.chart('wordcloud', {
                plotOptions: {
                    wordcloud: {
                        minFontSize: 45,
                        maxFontSize: 100
                    },
                    series: {
                        cursor: 'pointer',
                        events: {
                            click: function(event) {
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
            // var width = 0.95*$("#wordcloud").width();
            // var diameter = width,
            //     format = d3.format(",d"),
            //     color = d3.scale.category20c();
            //
            // var bubble = d3.layout.pack()
            //     .sort(null)
            //     .size([diameter, diameter])
            //     .padding(2.5);
            //
            // d3.select("#wordcloud").selectAll("svg").remove();
            // var svg = d3.select("#wordcloud").append("svg")
            //     .attr("width", diameter)
            //     .attr("height", diameter)
            //     .attr("class", "bubble");
            //
            //   var node = svg.selectAll(".node")
            //       .data(bubble.nodes(classes(jsonObject))
            //       .filter(function(d) { return !d.children; }))
            //     .enter()
            //     .append("g").style("cursor", "pointer").attr("onclick", function(d) { return `showKeywordTweetsFromBubble(this,event,'${d.className}')`; })
            //     .append("g")
            //       .attr("class", "node")
            //       .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
            //
            //   node.append("title")
            //       .text(function(d) { return d.className + ": " + format(d.value); });
            //
            //   node.append("circle")
            //       .attr("r", function(d) { return d.r; })
            //       .style("fill", function(d) { return colores_google(d.packageName); });
            //
            //   node.append("text")
            //       .attr("dy", ".3em")
            //       .style("text-anchor", "middle")
            //       .style("font-size", function(d) {
            //         var len = (d.className + " (" + format(d.value)+")").substring(0, d.r / 3).length;
            //         var size = d.r/3;
            //         size *= 10 / len;
            //         size += 1;
            //         return Math.round(size)+'px';
            //       })
            //       .text(function(d) { return (d.className + " (" + format(d.value)+")").substring(0, d.r / 3); });
            // //  });
            //
            // // Returns a flattened hierarchy containing all leaf nodes under the root.
            // function classes(root) {
            //   var classes = [];
            //
            //   function recurse(name, node) {
            //     if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
            //     else classes.push({packageName: node.color, className: node.name, value: node.size});
            //   }
            //
            //   recurse(null, root);
            //   return {children: classes};
            // }
            //
            // d3.select(self.frameElement).style("height", diameter + "px");
        }
    
    
    
        function colores_google(n) {
            var colores_g = ["#3276B1", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
            return colores_g[n % colores_g.length];
        }
    
        var hastag_cloud_tweets = null;
    
        function showHashtagTweetsFromBubble(element, evt, name) {
            if (hastag_cloud_tweets) {
                socket.emit('hastag_cloud_tweets', hastag_cloud_tweets, name);
            }
        }
        socket.on('hastag_cloud_processed', function(msg) {
            window.open(protocol + '://' + node_machine + "/hashtagCloud");
        })
    
        function drawHashTagBubbles(jsonString) {
            var jsonObject = jsonString;
            hastag_cloud_tweets = jsonObject.children;
            Highcharts.chart('hashtag_wordcloud', {
                plotOptions: {
                    wordcloud: {
                        minFontSize: 45,
                        maxFontSize: 100
                    },
                    series: {
                        cursor: 'pointer',
                        events: {
                            click: function(event) {
                                showHashtagTweetsFromBubble(event.target, event, event.target.textContent)
                            }
                        }
                    }
                },
                series: [{
                    type: 'wordcloud',
                    data: hastag_cloud_tweets,
                    name: 'Occurrences'
                }],
                title: {
                    text: 'Tweets Hashtag Cloud'
                }
            });
        }
        var infUserTgl = 1
    
        function influentialUsrCardToggle($evt) {
            let element = $evt.target;
            if (infUserTgl == 1) {
                $('.hideInfluentialUsrCard').show(1000)
                $(element).text("View Less..")
                infUserTgl = 0;
            } else if (infUserTgl == 0) {
                $('.hideInfluentialUsrCard').hide(1000)
                $(element).text("View More..")
                infUserTgl = 1;
            }
    
        }
        $scope.influentialUsrCardToggle = influentialUsrCardToggle;

        var actUserTgl = 1
    
        function activeUsrCardToggle($evt) {
            let element = $evt.target;
            if (actUserTgl == 1) {
                $('.hideActiveUsrCard').show(1000)
                $(element).text("View Less..")
                actUserTgl = 0;
            } else if (actUserTgl == 0) {
                $('.hideActiveUsrCard').hide(1000)
                $(element).text("View More..")
                actUserTgl = 1;
            }
    
        }
        $scope.activeUsrCardToggle = activeUsrCardToggle;

        var UserMentionTgl = 1
    
        function usrMentionCardToggle($evt) {
            let element = $evt.target;
            if (UserMentionTgl == 1) {
                $('.hideUsrMentionCard').show(1000)
                $(element).text("View Less..")
                UserMentionTgl = 0;
            } else if (UserMentionTgl == 0) {
                $('.hideUsrMentionCard').hide(1000)
                $(element).text("View More..")
                UserMentionTgl = 1;
            }
    
        }
        $scope.usrMentionCardToggle = usrMentionCardToggle;
        //TopK people with max followers
        function update_list_topK_user_with_max_followers(jsonString) {
            var jsonObject = jsonString;
            var obj = jsonString;
            var total = obj.length;
            //console.log("Total: "+total);
            if ($('ul#max_followers_ul > li').length >= 1)
                $("#max_followers_ul").empty();
    
            //$("#top_k_users").append('<div><label for="max_followers_ul">Most influential people:</label></div>');
            for (var i = 0; i < total; i++) {
                var profile_image_url_https = obj[i].profile_image_url_https + "#" + Math.random();
                var screen_name = obj[i].screen_name;
                var user_account_url = "https://twitter.com/" + obj[i].screen_name;
                var profile_banner_url = (obj[i].profile_banner_url)?obj[i].profile_banner_url: "/static/img/avatars/avatar-profile_640×640.png";
                var followers_count = obj[i].followers_count
                var friends_count = obj[i].friends_count
                var last_refreshed = obj[i].last_refreshed
                var user_id = obj[i].user_id
                var statuses_count = obj[i].statuses_count
                var name = obj[i].name
                var language = (obj[i].language) ? obj[i].language : "Not Available"
                var location = (obj[i].location) ? obj[i].location : "Not Available"
                if ($("#max_followers_img_" + i).length>0) {
                    $("#max_followers_img_" + i).removeAttr("src").attr('src', profile_image_url_https);
                    $("#max_followers_img_banner_" + i).removeAttr("src").attr('src', profile_banner_url).error(function() {
                        $(this).attr("src", "/static/img/avatars/avatar-profile_640×640.png");
                      });               
                    $("#max_followers_a_" + i).attr('href', user_account_url);
    
                    $("#max_followers_a_" + i).text(`@${screen_name}`);
                    $("#max_followers_fol_cnt_" + i).text(followers_count);
                    $("#max_followers_lastref_" + i).text(last_refreshed);
                    $("#max_followers_fnd_cnt_" + i).text(friends_count);
                    // var tweets_cloud_url =`/tweets_cloud?screen_name=AlbinJosephINC&followers_count=219&friends_count=123&location=Kottayam,kerala&statuses_count=830&name=Albin%20Joseph&language=en&profile_image_url_https=https://pbs.twimg.com/profile_images/1132322706265759744/9ekXPxoZ_normal.jpg&profile_banner_url=${profile_banner_url}`;
                    var tweets_cloud_url = `/tweetsCloud?profile_banner_url=${profile_banner_url}&screen_name=${screen_name}&followers_count=${followers_count}&friends_count=${friends_count}&location=${location}&statuses_count=${statuses_count}&name=${name}&language=${language}&profile_image_url_https=${profile_image_url_https}`
                    $("#max_followers_analysis_" + i).attr('href', tweets_cloud_url);
                } else {
                    
                    // var element = '<li class="img-li"><a id="max_followers_a_'+i+'" href="'+user_account_url+'" class="img-thumbnail img-responsive img-rounded" target="_blank"><img id="max_followers_img_'+i+'" src="'+profile_image_url_https+'" alt="50x50"></a></li>';
                    var args = [i, user_account_url, profile_image_url_https, profile_banner_url, screen_name, followers_count, friends_count, last_refreshed, user_id, obj[i]]
                    let influentialUsers = dyTemplates.influentialUsers(...args);
                    $("#max_followers_ul").append(influentialUsers);
                    //$("#img_ul_1").show();
                }
    
            }
        }
        var selectedFollowUserEvent = null;
        var selectedUnFollowUserEvent = null;
    
        function SinglefollowOrUnfollowUser(element, e, user_id) {
            e.preventDefault()
            bootbox.confirm("Excessive use of Follow/Unfollow options may result in your account getting blocked by Twitter. Do you want to continue?", function(confirmation) {
                if (confirmation) {
                    selectedFollowUserEvent = element;
                    if ($(element).text().trim() == 'Following') {
                        socket.emit("singleunfollow", user_id);
                    } else {
                        socket.emit("singlefollow", user_id);
                    }
                } else {
    
                }
            });
        }
    
        // function UnFollowUser(element, e, user_id){
        //   e.preventDefault()
        //     bootbox.confirm("Excessive use of Follow/Unfollow options may result in your account getting blocked by Twitter. Do you want to continue?", function(confirmation) {
        //       if(confirmation){
        //         selectedUnFollowUserEvent = element
        //          socket.emit("singleunfollow", user_id);
        //       }else{
        //
        //       }
        //     });
        // }
    
        socket.on("singlefollowResult", function(resultLocal, error) {
            if (resultLocal == 'success') {
                $(selectedFollowUserEvent).find('span').text("Following")
                Example.show("Now you are following selected users!");
            } else {
                // alert("Could not follow selected user.");
                alert("Twitter code:" + error[0].code + ' Message:' + error[0].message)
            }
        });
    
        socket.on("singleunfollowResult", function(resultLocal, error) {
            if (resultLocal == 'success') {
                $(selectedFollowUserEvent).find('span').text("Follow")
                Example.show("Now you are Unfollowing selected users!");
            } else {
                // alert("Could not Unfollow selected user.");
                alert("Twitter code:" + error[0].code + ' Message:' + error[0].message)
            }
        });
    
        //Top K users with max tweets
        function update_list_topK_user_with_max_tweets(jsonString) {
            var jsonObject = jsonString;
            var obj = jsonString;
            var total = obj.length;
            //console.log("Total: "+total);
            //$("#top_k_users").append('<div><label for="max_tweets_ul">Most active people:</label></div>');
            if ($('ul#max_tweets_ul > li').length >= 1)
                $("#max_tweets_ul").empty();
    
            for (var i = 0; i < total; i++) {
    
                var profile_image_url_https = obj[i].profile_image_url_https + "#" + Math.random();
                var user_account_url = "https://twitter.com/" + obj[i].screen_name;
                var screen_name = obj[i].screen_name;
                var profile_banner_url = (obj[i].profile_banner_url)?obj[i].profile_banner_url: "/static/img/avatars/avatar-profile_640×640.png";
                var followers_count = obj[i].followers_count
                var friends_count = obj[i].friends_count
                var last_refreshed = obj[i].last_refreshed
                var user_id = obj[i].user_id
                var statuses_count = obj[i].statuses_count
                var name = obj[i].name
                var language = (obj[i].language) ? obj[i].language : "Not Available"
                var location = (obj[i].location) ? obj[i].location : "Not Available"
                if ($("#max_tweets_img_" + i).length) {
                    $("#max_tweets_img_" + i).removeAttr("src").attr('src', profile_image_url_https);
                    $("#max_tweets_img_banner_" + i).removeAttr("src").attr('src', profile_banner_url).error(function() {
                        $(this).attr("src", "/static/img/avatars/avatar-profile_640×640.png");
                      });
                    $("#max_tweets_active_a_" + i).attr('href', user_account_url);
    
                    $("#max_tweets_active_a" + i).text(`@${screen_name}`);
                    $("#max_tweets_fol_cnt_" + i).text(followers_count);
                    $("#max_tweets_lastref_" + i).text(last_refreshed);
                    $("#max_tweets_fnd_cnt_" + i).text(friends_count);
                    var tweets_cloud_url = `/tweetsCloud?profile_banner_url=${profile_banner_url}&screen_name=${screen_name}&followers_count=${followers_count}&friends_count=${friends_count}&location=${location}&statuses_count=${statuses_count}&name=${name}&language=${language}&profile_image_url_https=${profile_image_url_https}`
                    $("#max_tweets_analysis_" + i).attr('href', tweets_cloud_url);
                } else {
                    // var element = '<li class="img-li"><a id="max_tweets_a_'+i+'" href="'+user_account_url+'" class="img-thumbnail img-responsive img-rounded" target="_blank"><img id="max_tweets_img_'+i+'" src="'+profile_image_url_https+'" alt="125x125"></a></li>';
                    // $("#max_tweets_ul").append(element);
                    var args = [i, user_account_url, profile_image_url_https, profile_banner_url, screen_name, followers_count, friends_count, last_refreshed, user_id, obj[i]]
                    $("#max_tweets_ul").append(dyTemplates.activeUsers(...args));
                }
            }
        }
    
    
        //Top K users with max mentions
        function update_list_topK_most_mentioned_users(jsonString) {
            var jsonObject = jsonString;
            var obj = jsonString;
            var total = obj.length;
            //console.log("Total: "+total);
            //$("#top_k_users").append('<div><label for="max_tweets_ul">Most active people:</label></div>');
            if ($('ul#most_mentioned_ul > li').length >= 1)
                $("#most_mentioned_ul").empty();
    
            for (var i = 0; i < total; i++) {
                var profile_image_url_https = obj[i].profile_image_url_https + "#" + Math.random();
                var profile_banner_url = (obj[i].profile_banner_url)?obj[i].profile_banner_url:"/static/img/avatars/avatar-profile_640×640.png";
                var friends_count = obj[i].friends_count;
                var followers_count = obj[i].followers_count;
                var last_refreshed = obj[i].last_refreshed;
                var screen_name = obj[i].name
                var user_id = obj[i].user_id
                var statuses_count = obj[i].statuses_count
                var name = obj[i].name
                var language = (obj[i].language) ? obj[i].language : "Not Available"
                var location = (obj[i].location) ? obj[i].location : "Not Available"
                // var profile_image_url_https = "https://twitter.com/"+obj[i].name+"/profile_image?size=normal"+"#"+Math.random();
                var user_account_url = "https://twitter.com/" + obj[i].name;
                // var profile_image_url_https = obj[i].profile_image_url_https+"#"+Math.random();
                // var user_account_url = "https://twitter.com/"+obj[i].screen_name;
    
                if ($("#most_mentioned_img_" + i).length) {
                    $("#most_mentioned_img_" + i).removeAttr("src").attr('src', profile_image_url_https);
                    $("#most_mentioned_a_" + i).attr('href', user_account_url);
                    $("#most_mentioned_img_banner_" + i).removeAttr("src").attr('src', profile_banner_url).error(function() {
                        $(this).attr("src", "/static/img/avatars/avatar-profile_640×640.png");
                      });
    
                    $("#most_mentioned_a_" + i).text(`@${screen_name}`);
                    $("#most_mentioned_fol_cnt_" + i).text(followers_count);
                    $("#most_mentioned_lastref_" + i).text(last_refreshed);
                    $("#most_mentioned_fnd_cnt_" + i).text(friends_count);
    
                    var tweets_cloud_url = `/tweetsCloud?profile_banner_url=${profile_banner_url}&screen_name=${screen_name}&followers_count=${followers_count}&friends_count=${friends_count}&location=${location}&statuses_count=${statuses_count}&name=${name}&language=${language}&profile_image_url_https=${profile_image_url_https}`
                    $("#most_mentioned_analysis_" + i).attr('href', tweets_cloud_url);
                } else {
                    // var element = '<li class="img-li"><a id="most_mentioned_a_'+i+'" href="'+user_account_url+'" class="img-thumbnail img-responsive img-rounded" target="_blank"><img id="most_mentioned_img_'+i+'" src="'+profile_image_url_https+'" alt="125x125"></a></li>';
                    // $("#most_mentioned_ul").append(element);
                    var args = [i, user_account_url, profile_image_url_https, profile_banner_url, screen_name, followers_count, friends_count, last_refreshed, user_id, obj[i]]
                    $("#most_mentioned_ul").append(dyTemplates.mostMentionedUsers(...args));
                }
            }
        }
    
        var escapeHTML = function(unsafe) {
            return unsafe.replace(/[&<"']/g, function(m) {
                switch (m) {
                    case '&':
                        return '&amp;';
                    case '<':
                        return '&lt;';
                    case '"':
                        return '&quot;';
                    default:
                        return '&#039;';
                }
            });
        };
    
    
        //Top K max retweets
        function update_list_topK_max_retweets(jsonString, custom_keywords) {
            var jsonObject = jsonString;
            var obj = jsonString;
            var total = obj.length;
            //console.log("Total: "+total);
            //$("#top_k_users").append('<div><label for="max_tweets_ul">Most active people:</label></div>');
            if ($('div#retweets_window > div').length >= 1) {
                $("#retweets_window").empty();
                //console.log("Clearing window!");
            }
            for (var i = 0; i < total; i++) {
                var tweet_id = obj[i].tweet_id;
                var retweet_id = obj[i].retweet_id;
                var retweet_user_name = obj[i].retweet_user_name;
                var retweet_user_screen_name = obj[i].retweet_user_screen_name;
                var retweet_text = (typeof(custom_keywords)) ? mixin.urlify(mixin.tweetsHighlight(obj[i].retweet_text, Object.keys(custom_keywords))) : mixin.urlify(obj[i].retweet_text);
                var retweet_user_profile_image_url_https = obj[i].retweet_user_profile_image_url_https + "#" + Math.random();
                var retweet_count = obj[i].retweet_count;
                var original_tweet_user_account_url = "https://twitter.com/" + retweet_user_screen_name;
                var retweet_id_str = obj[i].retweet_id_str.split(':').pop().trim()
                var retweet_user_location = (obj[i].retweet_user_location) ? obj[i].retweet_user_location.toString() : obj[i].retweet_user_location;
                var retweet_user_followers_count = obj[i].retweet_user_followers_count;
                var retweet_user_friends_count = obj[i].retweet_user_friends_count;
                var retweet_user_statuses_count = obj[i].retweet_user_statuses_count;
                var retweet_tweet_lang = obj[i].retweet_tweet_lang;
                var profile_banner_url = obj[i].profile_banner_url;
                var newEle;
                var tweet_id_m = tweet_id.replace("TID: ", "");
                var retweet_url = `https://twitter.com/intent/retweet?tweet_id=${retweet_id_str}`
                var tweets_cloud_url = `/tweetsCloud?profile_banner_url=${profile_banner_url}&screen_name=${retweet_user_screen_name}&followers_count=${retweet_user_followers_count}&friends_count=${retweet_user_friends_count}&location=${retweet_user_location}&statuses_count=${retweet_user_statuses_count}&name=${retweet_user_name}&language=${retweet_tweet_lang}&profile_image_url_https=${retweet_user_profile_image_url_https}`;
                var retweetBtn = '<a href="' + encodeURI(retweet_url) + '" class="btn-twitter" style="float:right;display:inline-block;box-shadow: 2px 2px 0px 0px rgba(0,0,0,0.75);margin: 0px 5px 0px 10px;"><i class="fa fa-twitter fa_logo fa-lg"></i> Retweet</a>';
                var analyseBtn = `<a href="${tweets_cloud_url}" target="_blank" class="btn-twitter" style="float:right;display:inline-block;box-shadow: 2px 2px 0px 0px rgba(0,0,0,0.75)"><i class="fa fa-twitter fa_logo fa-lg"></i> Analyze</a>`
                if (retweet_user_location !== '' && retweet_user_location !== null) {
                    newEle = '<div class="well well-lg col-xs-12 alternative_bg tweet-card" id=ele_retweet' + i + ' style="padding:8px;margin-bottom: 10px"><div style="float: left; margin: 0px 5px 3px 0px;width: 7%"><a id="max_tweets_a_' + i + '" href="' + original_tweet_user_account_url + '" class="img-thumbnail img-responsive img-rounded" target="_blank"><img src=' + retweet_user_profile_image_url_https + ' height=40 width=40></img></a></div><span style="width: 92%;color:#1565C0"><span style="font-weight: bold;">' + retweet_user_name + '</span>' + ' @' + retweet_user_screen_name + '  ' + ', <span style="font-weight: bold;color: #138ef3;">Retweet count: </span><span style="font-weight: bold;color: #138ef3;margin-left:4px"> ' + retweet_count + '</span>  ' + '<img src="/static/images/location2.png" height="auto" width="auto" style="margin-left:10px"></img>' + '<font color="#FF6600"> ' + retweet_user_location + ' </font> </br>' + ' <font color="#060606">' + retweet_text + '<div class="row ">' + retweetBtn + analyseBtn + '</div></span></div>';
                } else {
                    newEle = '<div class="well well-lg col-xs-12 alternative_bg tweet-card" id=ele_retweet' + i + ' style="padding:8px;margin-bottom: 10px"><div style="float: left; margin: 0px 5px 3px 0px;width: 7%"><a id="max_tweets_a_' + i + '" href="' + original_tweet_user_account_url + '" class="img-thumbnail img-responsive img-rounded" target="_blank"><img src=' + retweet_user_profile_image_url_https + ' height=40 width=40></img></a></div><span style="width: 92%;color:#1565C0"><span style="font-weight: bold;">' + retweet_user_name + '</span>' + ' @' + retweet_user_screen_name + '  ' + ', <span style="font-weight: bold;color: #138ef3;">Retweet count: </span><span style="font-weight: bold;color: #138ef3;margin-left:4px"> ' + retweet_count + '</span>  ' + '<img src="/static/images/location2.png" height="auto" width="auto" style="margin-left:10px"></img>' + '<font color="#FF6600"> Not available </font> </br>' + ' <font color="#060606">' + retweet_text + '<div class="row">' + retweetBtn + analyseBtn + '</div></span></div>';
    
                }
                $("#retweets_window").append(newEle);
            }
            var retweets_window = $('#retweets_window')
            retweets_window.scrollTop(retweets_window.get(0).scrollHeight);
        }
    
        function update_list_topK_insta_photos(jsonString) {
            var jsonObject = JSON.parse(jsonString);
            var obj = jQuery.parseJSON(jsonString);
            var total = obj.length;
    
            //console.log("Total: "+total);
            //$("#top_k_users").append('<div><label for="max_tweets_ul">Most active people:</label></div>');
            if ($('div#insta_photos_window > div').length >= 1)
                $("#insta_photos_window").empty();
    
            for (var i = 0; i < total; i++) {
    
                var img_url = obj[i].img_url;
                var profile_link = obj[i].profile_link;
                var likes_count = obj[i].likes_count;
                var comments_count = obj[i].comments_count;
    
                var newEle = '<div class="instagram-pic col-sm-3"><a href="' + profile_link + '" target="_blank"><img src="' + img_url + '" class="img-responsive"></a><div class="instagram-bar"> <div class="likes"><span class="glyphicon glyphicon-heart"></span>' + likes_count + '</div><div class="comments"><span class="glyphicon glyphicon-comment"></span>' + comments_count + '</div></div></div>';
                $("#insta_photos_window").append(newEle);
            }
        }
        var allKeywordForGoogleTrend;
    
        function update_google_trend(jsonString) {
            if (jsonString && !["[]", "Empty"].includes(jsonString)) {
                var jsonObject = JSON.parse(jsonString);
                allKeywordForGoogleTrend = jQuery.parseJSON(jsonString);
                pickTopKeywords();
                // allClientIntervals.push(setInterval(pickTopKeywords, 600000));
    
                // var total = obj.length; //Allowed only top 5 keywords
                // var str="";
                // var i=0;
                // for(; i<total; i++){
                //   var keywordCount = keywordMatchCount[obj[i].keyword]
                //   str += obj[i].keyword.replace(/\#/g, '%23')+((i!==total-1)?",":"");
                //   obj[i]['time'] = "today 12-m";
                //   obj[i]['count'] = keywordCount;
                // }
                // obj = obj.sort(function(first, second) {
                //         return second['count'] - first['count'];
                //       });
                // obj = obj.slice(0,5);
                // var url = `https://trends.google.com:443/trends/embed/explore/TIMESERIES?req={"comparisonItem":${JSON.stringify(obj)}}&tz=-420&q=${str}&hl=en-US`
                // $("#google_iframe").attr('src', url);
            } else {
                var url = "";
                $("#google_iframe").attr('src', url);
            }
        }
    
        function pickTopKeywords() {
            var obj = allKeywordForGoogleTrend;
            var total = obj.length;
            var str = "";
            var i = 0;
            for (; i < total; i++) {
                var keywordCount = keywordMatchCount[obj[i].keyword]
                // str += obj[i].keyword.replace(/\#/g, '%23')+((i!==total-1)?",":"");
                obj[i]['time'] = "today 12-m";
                obj[i]['count'] = keywordCount;
            }
            obj = obj.sort(function(first, second) {
                return second['count'] - first['count'];
            });
            obj = obj.slice(0, 5);
            str = obj.map(x => x.keyword.replace(/\#/g, '%23') + ((i !== total - 1) ? "," : "")).join(',');
            var url = `https://trends.google.com:443/trends/embed/explore/TIMESERIES?req={"comparisonItem":${JSON.stringify(obj)}}&tz=-420&q=${str}&hl=en-US`
            $("#google_iframe").attr('src', url);
            // setTimeout(pickTopKeywords,600000); //10 minutes gap to refresh
        }
    
        $(document).ready(function() {
            $('#instagramFunction').on('click', function() {
                var $cb = $(this).find(":checkbox");
                if (!$cb.prop("checked")) {
                    instagramFunction = 1;
                } else {
                    instagramFunction = 0;
                    $("#insta_photos_window").empty();
                }
            });
    
            let countryLanguages = [{
                    "label": "English",
                    "value": "en",
                    selected: true
                },
                {
                    "label": "Arabic",
                    "value": "ar"
                },
                {
                    "label": "Bengali",
                    "value": "bn"
                },
                {
                    "label": "Czech",
                    "value": "cs"
                },
                {
                    "label": "Danish",
                    "value": "da"
                },
                {
                    "label": "German",
                    "value": "de"
                },
                {
                    "label": "Greek",
                    "value": "el"
                },
                {
                    "label": "Spanish",
                    "value": "es"
                },
                {
                    "label": "Persian",
                    "value": "fa"
                },
                {
                    "label": "Finnish",
                    "value": "fi"
                },
                {
                    "label": "Filipino",
                    "value": "fil"
                },
                {
                    "label": "French",
                    "value": "fr"
                },
                {
                    "label": "Hebrew",
                    "value": "he"
                },
                {
                    "label": "Hindi",
                    "value": "hi"
                },
                {
                    "label": "Hungarian",
                    "value": "hu"
                },
                {
                    "label": "Indonesian",
                    "value": "id"
                },
                {
                    "label": "Italian",
                    "value": "it"
                },
                {
                    "label": "Japanese",
                    "value": "ja"
                },
                {
                    "label": "Korean",
                    "value": "ko"
                },
                {
                    "label": "Malay",
                    "value": "msa"
                },
                {
                    "label": "Dutch",
                    "value": "nl"
                },
                {
                    "label": "Norwegian",
                    "value": "no"
                },
                {
                    "label": "Polish",
                    "value": "pl"
                },
                {
                    "label": "Portuguese",
                    "value": "pt"
                },
                {
                    "label": "Romanian",
                    "value": "ro"
                },
                {
                    "label": "Russian",
                    "value": "ru"
                },
                {
                    "label": "Swedish",
                    "value": "sv"
                },
                {
                    "label": "Thai",
                    "value": "th"
                },
                {
                    "label": "Turkish",
                    "value": "tr"
                },
                {
                    "label": "Ukrainian",
                    "value": "uk"
                },
                {
                    "label": "Urdu",
                    "value": "ur"
                },
                {
                    "label": "Vietnamese",
                    "value": "vi"
                },
                {
                    "label": "Chinese (Simplified)",
                    "value": "zh-cn"
                },
                {
                    "label": "Chinese (Traditional)",
                    "value": "zh-tw"
                },
            ];
    
            $('#country_languages').multiselect({
                enableFiltering: true,
                filterPlaceholder: 'Search for language...',
                includeSelectAllOption: true,
                maxHeight: 400,
                nonSelectedText: "Choose Language",
                nSelectedText: "Languages",
                allSelectedText: 'All Languages',
                onSelectAll: function() {
                    this.$select.val().forEach((val) => {
                        countryLanguagesValue[val] = true;
                    });
                    socket.emit("countryLanguages", countryLanguagesValue);
                },
                onDeselectAll: function() {
                    countryLanguages.forEach((val) => {
                        countryLanguagesValue[val] = false;
                    });
                    socket.emit("countryLanguages", countryLanguagesValue);
                },
                onChange: function(option, checked, select) {
                    countryLanguagesValue[option.val()] = checked;
                    socket.emit("countryLanguages", countryLanguagesValue);
                    // if(Object.keys(keywordMap).length>0){
                    //   // selectedCountryLanguages = this.$select.val();
                    //   socket.emit("countryLanguages", countryLanguagesValue);
                    // }
                }
            });
            //  $('#country_languages').change(function() {
            //     test = this.$select.val();
            // });
            // countryLanguages.forEach((val)=>{
            //   $("#country_languages").append(`<option value="${val.value}">${val.label}</option>`);
            // })
            //
            $('#country_languages').multiselect('dataprovider', countryLanguages);        
    
        });
    
        // $(function() {
        //   $('#instagramFunction').change(function() {
        //     if(instagramFunction===0){
        //       instagramFunction=1;
        //     }
        //     else {
        //       instagramFunction=0;
        //       $("#insta_photos_window").empty();
        //     }
        //   })
        // })
    
        $(function() {
            $("#sentimentClassificationFunction").parent().on('click', function() {
                if (sentimentClassificationFunction == 0) {
                    socket.emit("turnOnSentiClass", "No data!");
                    $('#posNegTweetsClassRow').show();
                    $('#neutralTweetsClassRow').show();
                    sentimentClassificationFunction = 1;
                } else {
                    sentimentClassificationFunction = 0;
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
    
        function stopTimer() {
            timerClockDelay = 99999999999;
        }
    
        function startTimer() {
            timerClockDelay = 1000;
            time = 0;
            timerClock();
        }
    
        function restartTimer() {
            startTimer();
        }
    
        function clearTimer() {
            stopTimer();
            $('.responseTime').text("0:00:00");
            time = 0;
        }
    
    
        var tweetTlChartCntFlag = 0;
        var tweetTlChartDataset = [{
            label: '# of Tweets',
            backgroundColor: '#4e84f096',
            borderColor: '#2d6cd1',
            data: [0, 0, 0, 0, 0, 0]
        }]
        var generateTweetTimelineChart = function(twtTimelineChartLabel) {
            var ctx = document.getElementById("tweetTlChart");
            var myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: twtTimelineChartLabel,
                    datasets: tweetTlChartDataset
                },
                options: {
                    responsive: true,
                    tooltips: {
                        mode: 'index',
                    },
                    hover: {
                        mode: 'index'
                    },
                    scales: {
                        xAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: 'Timeline'
                            }
                        }],
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            },
                            scaleLabel: {
                                display: true,
                                labelString: 'Tweets'
                            }
                        }]
                    }
                }
            });
        }
        generateTweetTimelineChart(["0min", "10min", "20min", "30min", "40min", "50min", "60min"])
    
        socket.on('drawTweetsTimelineChart', function(chartMap, minutes) {
            if (tweetTlChartCntFlag === 0) {
                tweetTlChartDataset.pop();
                tweetTlChartCntFlag = 1;
            }
            if (minutes > 60) {
                generateTweetTimelineChart(["0min", "60 min", "90 min", "120 min", "150 min", "180 min", "210 min"])
            }
            var allChartMapKeys = Object.keys(chartMap);
            allChartMapKeys.forEach(function(keyword, key) {
                var dataset = chartMap[keyword];
                dataset['data'].forEach(function(data, index) {
                    if (index > 0 && data !== 0) {
                        dataset['data'][index] = Math.abs(dataset['data'][index] - dataset['data'][index - 1])
                    }
                })
                Chart.helpers.each(Chart.instances, function(chart) {
                    var datasetIndex = tweetTlChartDataset.findIndex(function(dataObj) {
                        return dataObj.keyword === keyword;
                    })
                    if (datasetIndex !== -1) {
                        tweetTlChartDataset[datasetIndex].data = dataset['data']
                    } else {
                        tweetTlChartDataset.push(dataset)
                    }
                    chart.update();
                });
            });
        });
        // Radialize the colors
        Highcharts.setOptions({
            colors: Highcharts.map(Highcharts.getOptions().colors, function(color) {
                return {
                    radialGradient: {
                        cx: 0.5,
                        cy: 0.3,
                        r: 0.7
                    },
                    stops: [
                        [0, color],
                        [1, Highcharts.Color(color).brighten(-0.3).get('rgb')] // darken
                    ]
                };
            })
        });
    
        // Create the chart
    
        Highcharts.chart('tweet_dtls', {
            chart: {
                type: 'column'
            },
            title: {
                text: 'Tweets Details'
            },
            xAxis: {
                type: 'category'
            },
            yAxis: {
                title: {
                    text: 'Total tweets'
                }
    
            },
            legend: {
                enabled: false
            },
    
    
            series: [{
                name: "Tweets",
                colorByPoint: true,
                data: []
            }]
        });
    
        function drawDonutChart() {
            var tweets_dtl_chart_data = [];
            var tweets_dtls_keys = Object.keys(tweets_dtls_for_donut)
            tweets_dtls_keys.forEach(function(val, key) {
                if (tweets_dtls_for_donut.hasOwnProperty(val) && tweets_dtls_for_donut[val]['count'] !== 0) {
                    if (val !== "totalsenticount") {
                        tweets_dtl_chart_data.push({
                            name: tweets_dtls_for_donut[val]['label'],
                            y: tweets_dtls_for_donut[val]['count']
                        })
                    }
                }
            })
            var tweet_dtls_chart = $('#tweet_dtls').highcharts();
            tweet_dtls_chart.series[0].update({
                data: tweets_dtl_chart_data
            }, false);
            // let positive = (tweets_dtls_for_donut.posSentCount)?tweets_dtls_for_donut.posSentCount.count:0;
            // let negative = (tweets_dtls_for_donut.negSentCount)?tweets_dtls_for_donut.negSentCount.count:0;
            // let neutral = (tweets_dtls_for_donut.neutralSentCount)?tweets_dtls_for_donut.neutralSentCount.count:0;
            tweet_dtls_chart.redraw();
            //  setTimeout(drawDonutChart, 2000)
        }
        // drawDonutChart()
        allClientIntervals.push(setInterval(drawDonutChart, 2000));
    
    
        Highcharts.chart('total_user_twts', {
            chart: {
                zoomType: 'xy'
            },
            title: {
                text: 'Processed Tweets'
            },
            xAxis: [{
                categories: [],
            }],
            yAxis: [{ // Primary yAxis
                labels: {
                    format: '{value}°C',
                    style: {
                        color: Highcharts.getOptions().colors[2]
                    }
                },
                opposite: true
    
            }, { // Secondary yAxis
                gridLineWidth: 1,
                title: {
                    text: 'Total Tweets',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                }
    
            }],
            tooltip: {
                shared: true
            },
            legend: {
                layout: 'vertical',
                align: 'left',
                x: 80,
                verticalAlign: 'top',
                y: 55,
                floating: true,
                backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || // theme
                    'rgba(255,255,255,0.25)'
            },
            series: [{
                name: 'Tweets',
                type: 'column',
                yAxis: 1,
                data: [],
    
            }],
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 500
                    },
                    chartOptions: {
                        legend: {
                            floating: false,
                            layout: 'horizontal',
                            align: 'center',
                            verticalAlign: 'bottom',
                            x: 0,
                            y: 0
                        }
                    }
                }]
            }
        });
    
    
        socket.emit("get_user_audit_log", "days");
        var twtsCntTimeout = null;
        socket.on("audit_log_data", function(auditLogData, data) {
    
    
            function execute_instantly(auditLogData, data) {
                if (auditLogData.length > 0 || tweetsCount > 0) {
                    if (tweetsCount > 0) {
                        var temp = {
                            "total_tweets": tweetsCount,
                            "createdAt": new Date(),
                            "customTempField": true
                        }
                        var customTempFieldIndex = auditLogData.findIndex(x => x.customTempField);
                        if (customTempFieldIndex !== -1) {
                            auditLogData[customTempFieldIndex] = temp;
                        } else {
                            auditLogData.push(temp);
                        }
                    }
                    evaluate_chart(auditLogData, data);
                    twtsCntTimeout = setTimeout(execute_instantly, 3000, auditLogData, data);
                } else {
                    twtsCntTimeout = setTimeout(execute_instantly, 500, auditLogData, data);
                }
    
            }
            execute_instantly(auditLogData, data); //Helps to update the tweetscount instantly
    
            function evaluate_chart(auditLogData, data) {
                if (auditLogData && auditLogData.length > 0) {
                    var processed_twt_data = [],
                        processed_twt_xaxis_category = []
                    if (data === "days") {
                        for (var i = 0; i < 10; i++) {
                            var dateFilter = new Date();
                            dateFilter.setDate(dateFilter.getDate() - i);
                            dateFilter = moment(dateFilter).format("YYYY-MM-DD");
                            let temp = {
                                "y": 0,
                                "name": dateFilter
                            };
                            let filteredAuditData = auditLogData.filter(x => moment(x.createdAt).format("YYYY-MM-DD") == dateFilter);
                            if (filteredAuditData.length > 0) {
                                let sum = filteredAuditData.reduce((s, f) => {
                                    return s + parseInt(f.total_tweets); // return the sum of the accumulator and the current time, as the the new accumulator
                                }, 0);
                                temp = {
                                    "y": sum,
                                    "name": dateFilter
                                }
                            }
                            processed_twt_xaxis_category.push(temp.name);
                            processed_twt_data.push(temp);
                        }
                        process_chart(processed_twt_xaxis_category, processed_twt_data);
                    } else if (data === "weeks") {
                        for (var i = 0; i < 4; i++) {
                            let startDate = moment().isoWeek(moment().subtract(i + 1, 'w').week()).format("YYYY-MM-DD")
                            let endDate = moment().isoWeek(moment().subtract(i, 'w').week()).format("YYYY-MM-DD")
                            let temp = {
                                "y": 0,
                                "name": `week${i+1}(${startDate})`
                            };
                            let filteredAuditData = auditLogData.filter(x => moment(x.createdAt).format("YYYY-MM-DD") >= startDate && moment(x.createdAt).format("YYYY-MM-DD") <= endDate);
                            if (filteredAuditData.length > 0) {
                                let sum = filteredAuditData.reduce((s, f) => {
                                    return s + parseInt(f.total_tweets); // return the sum of the accumulator and the current time, as the the new accumulator
                                }, 0);
                                temp = {
                                    "y": sum,
                                    "name": `week${i+1}(${startDate})`
                                }
                            }
                            processed_twt_xaxis_category.push(temp.name);
                            processed_twt_data.push(temp);
                        }
                        process_chart(processed_twt_xaxis_category, processed_twt_data);
                    } else if (data === "months") {
                        for (var i = 0; i < 12; i++) {
                            let dateFilter = moment().subtract(i, 'months').format('MMM');
                            let temp = {
                                "y": 0,
                                "name": dateFilter
                            };
                            let filteredAuditData = auditLogData.filter(x => moment(x.createdAt).format('MMM') == dateFilter);
                            if (filteredAuditData.length > 0) {
                                let sum = filteredAuditData.reduce((s, f) => {
                                    return s + parseInt(f.total_tweets); // return the sum of the accumulator and the current time, as the the new accumulator
                                }, 0);
                                temp = {
                                    "y": sum,
                                    "name": dateFilter
                                }
                            }
                            processed_twt_xaxis_category.push(temp.name);
                            processed_twt_data.push(temp);
                        }
                        process_chart(processed_twt_xaxis_category, processed_twt_data);
                    }
                }
            }
    
            function process_chart(processed_twt_xaxis_category, processed_twt_data) {
                var processed_twt_chart = $('#total_user_twts').highcharts();
                processed_twt_chart.xAxis[0].update({
                    categories: processed_twt_xaxis_category.reverse()
                }, false);
                processed_twt_chart.series[0].update({
                    data: processed_twt_data.reverse()
                }, false);
                processed_twt_chart.redraw();
            }
    
        })
    
        function getProcessedTwtsCnt(element) {
            let selected = $(element).val();
            clearTimeout(twtsCntTimeout);
            socket.emit("get_user_audit_log", selected);
        }
    
        socket.on("exception", function() {
            $("#loading-indicator").hide();
            bootbox.confirm({
                message: "System has encountered a fatal error and your administrator has been notified.Contact your admin at <span class='anchor'><a href='mailto:mike.socal@quantumventura.com?Subject=Exception Message' target='_blank'>mike.socal@quantumventura.com</a></span> immediately. System exiting now after all files are saved. Do you want to logout?",
                title: "<label class='exception_title'>Twitterplay Exception!</label>",
                buttons: {
                    confirm: {
                        label: 'Yes',
                        className: 'btn-success'
                    },
                    cancel: {
                        label: 'No',
                        className: 'btn-danger'
                    }
                },
                callback: function(result) {
                    if (result == true) {
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
                        Example.show("saved " + tweetsCount + " tweets successfully.");
                        window.location.href = protocol + '://' + node_machine + "/";
                    }
                }
            });
            $('.exception_title').parent().parent().addClass("btn-danger")
        })
        // allClientIntervals.push(setInterval(memoryUsage, 500));
        // function memoryUsage(){
        //     socket.emit("memoryUsage", "No Data");
        // }    
        socket.emit("memoryUsageRequest", "No Data");
        socket.on("memoryUsageResponse", function(memoryObj){
            $("#heapDtls").text(memoryObj.heapUsed+"/"+ memoryObj.heapTotal);
            $("#heapPercent").text(memoryObj.heapUsedPercent);
            $("#progressBar").css("width", memoryObj.heapUsedPercent+"%");    
            if(memoryObj.heapUsedPercent>95 && memoryObj.heapUsedPercent <99.3){
                Example.show("Almost reached maximum heap size.Twitterplay expected to logout soon...","danger");
                socket.emit("memoryUsageRequest", "No Data");
            } 
            else if(memoryObj.heapUsedPercent>99.3){
                socket.emit("abort", "No Data!");
            }   
            else{
                socket.emit("memoryUsageRequest", "No Data");
            }
            
        });
        function closeHeapCard($evt){
            $evt.preventDefault();
            $(".heap-size").hide(1000);
            $("#heap-toggle").bootstrapToggle('off');        
        } 
        $scope.closeHeapCard = closeHeapCard;
        
    // Pelias Map  
    angular.extend($scope, {
        center: {
            lat: 0,
            lng: 0,
            zoom: 2
        },
        events: {
            map: {
                enable: ['moveend', 'popupopen'],
                logic: 'emit'
            },
            marker: {
                enable: [],
                logic: 'emit'
            }
        },
        layers: {
            baselayers: {
                osm: {
                    name: 'OpenStreetMap',
                    type: 'xyz',
                    url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                }
            },
            overlays: {
                realworld: {
                    name: "Real world data",
                    type: "markercluster",
                    visible: true
                }
            }
        },
        controls: {
            fullscreen: {
                position: 'topleft'
            }
        }
    });  
    // var addressPointsToMarkers = function(points) {
    //     return points.map(function(ap) {
    //         return {
    //             layer: 'realworld',
    //             lat: ap[0],
    //             lng: ap[1],
    //             focus: false,
    //             message: "<h1>I'm a static marker with defaultIcon<h1>",
    //             getMessageScope: function() {return $scope; }
    //         };
    //     });
    // };
    $scope.markers = {};
    let tweets_location_cnt_in_map = 0;
    $("#tweets_location_cnt_in_map").text(tweets_location_cnt_in_map);
    $scope.refresh_map = function(){
        setTimeout(function(){ $scope.$apply(); });
    }
    allClientIntervals.push(setInterval(function(){ $scope.$apply(); }, 2000));
    let i=1;
    var addressPointsToMarkers = function(mapMarkerData) {
        tweets_location_cnt_in_map++;
        $("#tweets_location_cnt_in_map").text(tweets_location_cnt_in_map);
        let screen_name = mapMarkerData.screen_name, 
            location = mapMarkerData.location
            text = mapMarkerData.text,
            profile_image_url_https = mapMarkerData.profile_image_url_https,
            name  = mapMarkerData.name,
            user_account_url = "https://twitter.com/" + screen_name;
        let tweetCard = `<div class="well well-lg col-xs-12 alternative_bg tweet-card" style="padding:8px;margin-bottom: 10px">
            <div style="float: left;margin: 0px 5px 3px 0px;width: 7%;"><a href="${user_account_url}" class="img-thumbnail img-responsive img-rounded" target="_blank"><img src=${profile_image_url_https} height=40 width=40></img></a></div><span style="width: 92%;color:#1565C0"><span style="font-weight: bold;">${name}</span>  @ ${screen_name} <img src="/static/images/location2.png" height="auto" width="auto" style="margin-left:10px"></img><font color="#0099CC"> ${location}</font></br><font color="#060606">${text}</span>
        </div>`;
        let temp = {
            layer: 'realworld',
            lat: mapMarkerData.lat,
            lng: mapMarkerData.lng,
            focus: true,
            tite: screen_name,
            message: tweetCard
        };
        $scope.markers["m"+(i++)] = temp;
    };
    function getMapCoordinates(mapMarkerData){
        // let screen_name = mapMarkerData.screen_name, 
        //     location = mapMarkerData.location,
        //     text = mapMarkerData.text,
        //     profile_image_url_https = mapMarkerData.profile_image_url_https,
        //     name  = mapMarkerData.name;

        // mapMarkerData = {
        //     screen_name,
        //     location,
        //     text,
        //     profile_image_url_https,
        //     name
        // }
        socket.emit("peliasMap", mapMarkerData);
               
        // remoteCall.get(`${pelias_host}/v1/autocomplete`, dataInput).then((data)=>{
        //     if(data.status === 200 && data.data["features"].length>0){
        //         let features = data.data["features"][0];
        //         let temp = {
        //             lat: features.geometry.coordinates[1],
        //             lng: features.geometry.coordinates[0],
        //             msg: mapMarkerData.msg
        //         };
        //         addressPointsToMarkers(temp);
        //     }
        // });
    }
    socket.on("getPeliasMap", function(mapData){
        addressPointsToMarkers(mapData);
    });
    
    
    } catch (ex) {
        bugsnagClient.notify(ex);
        socket.emit("uiException", ex.stack);
        socket.on("exception", function() {
            $("#loading-indicator").hide();
            bootbox.confirm({
                message: "System has encountered a fatal error and your administrator has been notified.Contact your admin at <span class='anchor'><a href='mailto:mike.socal@quantumventura.com?Subject=Exception Message' target='_blank'>mike.socal@quantumventura.com</a></span> immediately. System exiting now after all files are saved. Do you want to logout?",
                title: "<label class='exception_title'>Twitterplay Exception!</label>",
                buttons: {
                    confirm: {
                        label: 'Yes',
                        className: 'btn-success'
                    },
                    cancel: {
                        label: 'No',
                        className: 'btn-danger'
                    }
                },
                callback: function(result) {
                    if (result == true) {
                        window.location.href = protocol + '://' + node_machine + "/";
                    }
                }
            });
            $('.exception_title').parent().parent().addClass("btn-danger")
        })
    }
    
}]);



function heapToggleSettings(element){
    if($(element).prop('checked')){
        $(".heap-size").show(1000);
    }
    else{
        $(".heap-size").hide(1000);
    }
}