var _ = require('underscore');
var fs = require('fs');
var moment = require('moment')
var Components = require('../helpers/components')

function TweetsCloudController() {}
TweetsCloudController.prototype.urlify = function(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
        return '';
    })
}
TweetsCloudController.prototype.tweetsCloudViewTemplate = function(req, res, app, http, clientREST, logger, ignoreList, hastagCloud, keywordCloud, query, allSocketConnection) {
    var self = this;
    var io = require('socket.io')(http, {
        path: '/tweet_cloud' // Set path to maintain different connection with different session
    });
    var default_values_json = JSON.parse(fs.readFileSync('config/default_values_twitterplay.json', 'utf8'));
    const NO_OF_MOST_MENTIONED_USERS_TOBE_STORED_IN_FILE = default_values_json["no_of_most_mentioned_users_tobe_stored_in_file"];
    var map = new Object();
    var unImp = ignoreList[0],
        unImpLength = ignoreList[1],
        hashtagTweets = null,
        counterTweets = 0;
    io.of("/tweet_cloud_nsp").on("connection", function(socket) { //nsp => namespace
        allSocketConnection.push(socket);

        function userTimeline(timelineTwtsCnt, days) {
            var params = {
                screen_name: query.screen_name,
                count: timelineTwtsCnt,
                tweet_mode: "extended"
            };
            clientREST.get('statuses/user_timeline.json', params, function(error, data, response) {
                debugger
                if (error) {
                    logger.error('error', error)
                } else {
                    // var start_date_dd = parseInt(moment(new Date()).format("DD"));
                    // var start_date_mm = parseInt(moment(new Date()).format("MM"));
                    // var start_date_yy = parseInt(moment(new Date()).format("YYYY"));
                    // var filteredTweets = _.filter(data,function(val,key){
                    //     var tweet_dd = parseInt(moment(new Date(val.created_at)).format("DD"));
                    //     var tweet_mm = parseInt(moment(new Date(val.created_at)).format("MM"));
                    //     var tweet_yy = parseInt(moment(new Date(val.created_at)).format("YYYY"));
                    //     return moment([start_date_yy, start_date_mm, start_date_dd]).diff(moment([tweet_yy, tweet_mm, tweet_dd]), 'days', true) >=((days)?days:10)  // Defaulted to last 10 days
                    // });
                    // debugger
                    // if(filteredTweets.length>0){
                    _.each(data, function(tweet, key) {
                        // var tweet_dd = parseInt(moment(new Date(tweet.created_at)).format("DD"));
                        // var tweet_mm = parseInt(moment(new Date(tweet.created_at)).format("MM"));
                        // var tweet_yy = parseInt(moment(new Date(tweet.created_at)).format("YYYY"));
                        // var daysDiff = moment([start_date_yy, start_date_mm, start_date_dd]).diff(moment([tweet_yy, tweet_mm, tweet_dd]), 'days', true)
                        // if(daysDiff<=((days)?days:10)){
                        var text = (tweet.full_text) ? tweet.full_text : tweet.text;
                        text = self.urlify(text);
                        text = text.toLowerCase();
                        text = text.trim().replace(/["~!$%^&*\(\)_+=`{}\[\]\|\\:;'<>,.\/?"\- \t\r\n]+/g, '-'); //Remove all special characters except #
                        for (var i = 0; i < unImpLength - 1; i++) {
                            text = text.replace(new RegExp("\\b" + unImp[i] + "\\b", "g"), " ");
                        }
                        text = text.replace(/\s{2,}/g, ' ');
                        var strArray = text.split(' ');
                        strArray.forEach(function(entry) {
                            if (entry.length > 1) {
                                if (typeof(map[entry]) == "undefined") {
                                    map[entry] = [1, Date.now(), 3, "", [tweet]];
                                } else {
                                    map[entry][0]++;
                                    map[entry][1] = Date.now();
                                    if (Array.isArray(map[entry][4])) {
                                        map[entry][4].push(tweet)
                                    } else {
                                        map[entry][4] = [tweet]
                                    }
                                }
                            }
                        });
                        var text = (tweet.full_text) ? tweet.full_text : tweet.text;
                        var hashtags = tweet.entities.hashtags;
                        var user_mentions = tweet.entities.user_mentions;
                        if (hashtags.length != 0) {
                            hashtagTweets++;
                            for (var i = 0; i < hashtags.length; i++) {
                                var hashtag = '#' + hashtags[i].text;
                                var hashTagOriginal = hashtag;
                                text = text.replace(hashtag, '');
                                hashtag = hashtag.toLowerCase();
                                if (typeof(map[hashtag]) == "undefined") {
                                    map[hashtag] = [1, Date.now(), 1, hashTagOriginal, [tweet]];
                                } else {
                                    map[hashtag][0]++;
                                    map[hashtag][1] = Date.now();
                                    if (Array.isArray(map[hashtag][4])) {
                                        map[hashtag][4].push(tweet)
                                    } else {
                                        map[hashtag][4] = [tweet]
                                    }

                                }
                            }
                        }
                        // }
                    })
                    var tmpMap = map;
                    var sortable = [];
                    var onlyHashTags = [];
                    var onlyMentions = [];
                    var entryCounter = 0;
                    for (var item in tmpMap) {
                        if ((tmpMap[item][0] == 1 || tmpMap[item][0] == 2 || tmpMap[item][0] == 3) && (Date.now() - tmpMap[item][1]) / 60000 > 7.0) {
                            delete map[item];
                            continue;
                        }
                        entryCounter++;
                        if (item != '') {
                            if (tmpMap[item][2] === 1) {
                                onlyHashTags.push({
                                    name: tmpMap[item][3],
                                    size: tmpMap[item][0],
                                    weight: tmpMap[item][0], //For Highcharts
                                    // color: "3",
                                    tweet: tmpMap[item][4]
                                });
                            } else if (tmpMap[item][2] === 2) {
                                onlyMentions.push({
                                    name: tmpMap[item][3],
                                    size: tmpMap[item][0],
                                    color: "3",
                                    profile_image_url_https: tmpMap[item][4],
                                    profile_banner_url: tmpMap[item][5],
                                    last_refreshed: moment(new Date()).format('HH:MM:SS'),
                                    friends_count: tmpMap[item][6],
                                    user_id: tmpMap[item][7],
                                    followers_count: tmpMap[item][8]
                                });
                            }
                            sortable.push({
                                name: item,
                                size: tmpMap[item][0],
                                weight: tmpMap[item][0],
                                tweet: tmpMap[item][4],
                                // color: "0" //For Highcharts
                            });
                        }
                    }

                    console.log("No of entries in Map: " + entryCounter);
                    console.log("Total tweets: " + counterTweets);
                    sortable.sort(function(a, b) {
                        return b.size - a.size
                    });
                    onlyHashTags.sort(function(a, b) {
                        return b.size - a.size
                    });
                    onlyMentions.sort(function(a, b) {
                        return b.size - a.size
                    });
                    var arr = sortable.slice(0, 100);
                    var top100HashTags = onlyHashTags.slice(0, 100);
                    top10HashTagsForInsta = onlyHashTags.slice(0, 100);
                    mentionedUsers = onlyMentions.slice(0, NO_OF_MOST_MENTIONED_USERS_TOBE_STORED_IN_FILE);
                    var obj = new Object();
                    obj.name = "flare";
                    obj.children = arr;
                    var jsonString = JSON.stringify(obj);
                    socket.emit('takeTopKKeywords', jsonString);
                    var tmpObj = new Object();
                    tmpObj.name = "flare";
                    tmpObj.children = top100HashTags;
                    var jsonStringTop100HashTags = JSON.stringify(tmpObj);
                    socket.emit('takeTopKHashtags', jsonStringTop100HashTags);
                    // }
                    // else{
                    //    userTimeline(timelineTwtsCnt+50, days)
                    // }
                }
            });
        }
        userTimeline(50);
        // socket.on('latestKeywordsAndHashTagsOnDays', function(days){
        //     debugger
        //     map = new Object()
        //     var loadTwtCnt = (days===10)?50:(days===20)?100:150;
        //     userTimeline(loadTwtCnt, days)
        // });
        socket.on('latestKeywordsAndHashTagsOnDays', function(twtsCnt) {
            map = new Object()
            userTimeline(twtsCnt)
        });
        socket.on('hastag_cloud_tweets', function(hastagObj, hashtagName) {
            hastagCloud.tweets = hastagObj;
            hastagCloud.name = hashtagName;
            socket.emit('hastag_cloud_processed', hastagCloud);
        })
        socket.on('keyword_cloud_tweets', function(keywordObj, keywordName) {
            keywordCloud.tweets = keywordObj;
            keywordCloud.name = keywordName;
            socket.emit('keyword_cloud_processed', keywordCloud);
        })

        socket.on('connect_failed', function() {
            logger.error('error', 'Sorry, there seems to be an issue with the connection!');
        });
        socket.on('error', function(err) {
            logger.error('error', 'Socket Error Exception:', err);
        });

    })
}

module.exports = TweetsCloudController