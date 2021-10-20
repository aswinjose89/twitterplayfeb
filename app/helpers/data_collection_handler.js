var Promise = require('bluebird');
var _ = require('underscore');
const axios = require('axios');
var settings = require('../../settings.js');
var logger = settings.logger;
var dtDrawCount = 1;
var auditDtDrawCount = 1;
var LiveTwtsUserActions = require('../models/live_twts_user_actions');
var LiveTweets = require('../models/live_tweets');
var Components = require('./components');
var sharedSvc = require('../services/shared_svc.js');
var mixinComp = new Components();

function DataCollectionMixin() {}
DataCollectionMixin.prototype.processLiveTweetsData = function(data) {
    var tmpData = [];
    _.each(data, function(val, key) {
        _.each(val.tweets, function(twtVal, twtKey) {
            tmpData.push(twtVal);
        })
    })
    return tmpData;
}
DataCollectionMixin.prototype.getLiveTweets = function(userData, queryParams) {
    var LiveTweets = require('../models/live_tweets');
    // const findQuery = [
    //               {$unwind: "$tweets" },
    //               {$match:{'tweets.tweet_id_str':{$in:['1128710618641575936','1128710737734455296','1128710742671278082']}}},
    //               {$sort : { 'tweets.tweet_id_str' : -1}},
    //               {$group: {_id: "$tweets.tweet_id_str", tweets: {$push: "$tweets"} } },
    //               {$facet : {
    //                             metadata: [ { $count: "total" }, { $addFields: { page: 3 } } ],
    //                             data: [ { $skip: 0 }, { $limit: 1 } ] // add projection here wish you re-shape the docs
    //                         }
    //               },
    //           ];
    var recordLength = parseInt(queryParams['length']);
    var offset = parseInt(queryParams['start']);
    debugger
    var date_range = queryParams['date_range'];

    var custom_keys = queryParams['custom_keys'];
    var session_ids = queryParams['session_ids']; //From SessionWIse Tab
    var username = userData.twitter.username;

    // var startDate = new Date(queryParams['date_range']['startDate']),
    //     endDate = new Date(queryParams['date_range']['endDate']);

    var $matchFilter = {}, isParamPresents = false;
    $matchFilter['username'] = username;
    if (date_range && date_range['startDate']) {
        var startDate = new Date(date_range['startDate']),
            endDate = new Date(date_range['endDate']);
        $matchFilter['created_at'] = {
            $gte: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()),
            $lte: new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() ,23,59,59)
        }
        isParamPresents = true;
    }
    if (custom_keys && custom_keys.length > 0) {
        // custom_keys.push("unreliable_key");
        $matchFilter['custom_keywords'] = {
            $in: custom_keys
        }
        isParamPresents = true;
    }  
    if (session_ids && session_ids.length > 0) {
        $matchFilter['session_id'] = {
            $in: session_ids.map(x=>parseInt(x))
        }
        isParamPresents = true;
    }  
    // const findQuery = [
    //               {$match: $matchFilter},
    //               {$unwind: "$tweets" },
    //               {$sort : { 'createdAt' : -1}},
    //               {$group: {_id: "$tweets.tweet_id_str", tweets: {$push: "$tweets"} } },
    //               {$lookup: {from: 'customKeywords', localField: 'custom_keywords', foreignField: '_id', as: 'keywords'} },
    //               {$facet : {
    //                             metadata: [ { $count: "recordsTotal" }, { $addFields: { page: 1 } } ],
    //                             data: [ { $skip: offset }, { $limit: recordLength } ] // add projection here wish you re-shape the docs
    //                   }
    //               },
    //           ];
    // $matchFilter['tweets.tweet_id_str'] = {$in:["1150085986237526017"]} //Test
    const findQuery = [{
            $match: $matchFilter
        },
        // {$lookup: {from: 'customKeywords', localField: 'custom_keywords', foreignField: '_id', as: 'keywords'} },
        {
            $facet: {
                metadata: [{
                    $count: "recordsTotal"
                }, {
                    $addFields: {
                        page: 1
                    }
                }],
                data: [{
                    $skip: offset
                }, {
                    $limit: recordLength
                }] // add projection here wish you re-shape the docs
            }
        }
    ];
    return new Promise(function(resolve) {
        if(isParamPresents){
            var streamData = null;            
            var stream = LiveTweets.aggregate(findQuery).exec((err, streamData) =>{
                if (err) {
                    logger.log("error", "FileName:data_collection_handler.js, FunctionName:getLiveTweets, Failed to get User due to the Exception = %s", err);
                }
                else{
                    var responseData = streamData[0];
                    if (responseData) {
                        // var live_twt_data = self.processLiveTweetsData(responseData.data)
                        var live_twt_data = responseData.data;
                        let dataSet = {
                            'draw': dtDrawCount++,
                            // 'recordsFiltered': (responseData.data.length>0)?responseData.data.length:10,
                            'recordsFiltered': (responseData.metadata[0]) ? responseData.metadata[0].recordsTotal : 10,
                            'recordsTotal': (responseData.metadata[0]) ? responseData.metadata[0].recordsTotal : 0,
                            'data': live_twt_data
                        };
                        resolve(dataSet);
                    } else {
                        let dataSet = {
                            'draw': 1,
                            'recordsFiltered': 0,
                            'recordsTotal': 0,
                            'data': []
                        };
                        resolve(dataSet);
                    }
                }                

            });
            // stream.on('data', function(doc) {
            //     streamData = doc;
            // });
            // stream.on('end', function() {
            //     var responseData = streamData;
            //     if (responseData) {
            //         // var live_twt_data = self.processLiveTweetsData(responseData.data)
            //         var live_twt_data = responseData.data;
            //         let dataSet = {
            //             'draw': dtDrawCount++,
            //             // 'recordsFiltered': (responseData.data.length>0)?responseData.data.length:10,
            //             'recordsFiltered': (responseData.metadata[0]) ? responseData.metadata[0].recordsTotal : 10,
            //             'recordsTotal': (responseData.metadata[0]) ? responseData.metadata[0].recordsTotal : 0,
            //             'data': live_twt_data
            //         };
            //         resolve(dataSet);
            //     } else {
            //         let dataSet = {
            //             'draw': 1,
            //             'recordsFiltered': 0,
            //             'recordsTotal': 0,
            //             'data': []
            //         };
            //         resolve(dataSet);
            //     }

            // });
        }
        else{
            let dataSet = {
                'draw': 1,
                'recordsFiltered': 0,
                'recordsTotal': 0,
                'data': []
            };
            resolve(dataSet);
        }
        

    });

}
var data_col_mixin = new DataCollectionMixin()

function DataCollectionHandler() {
    this.sessionstorage = require('sessionstorage');
    this.User = require('../models/user');
}

DataCollectionHandler.prototype.generateBufferedTwtsObj = function(tweet) {
    var tweet_text = mixinComp.get_tweet_text(tweet);
    var name = tweet.user.name;
    var user_id = tweet.user.id;
    var screen_name = tweet.user.screen_name;
    var location = tweet.user.location;
    var tweet_id = tweet.id;
    var tweet_id_str = tweet.id_str;
    var language = tweet.lang;
    var user_description = tweet.user.description;
    var retweeted_status = tweet.retweeted_status;
    var source = tweet.source;
    var RT_ID_str = "N/A";
    var RT_when_created = "";
    var RT_screen_name = "N/A";
    var RT_count = 0;

    if (retweeted_status && retweeted_status !== "null" && retweeted_status !== "undefined") {
        RT_ID_str = "RT ID: " + retweeted_status.id_str;
        RT_when_created = retweeted_status.created_at;
        RT_screen_name = retweeted_status.user.screen_name;
        RT_count = retweeted_status.retweet_count;
    }

    if (location && location !== "null" && location !== "undefined") {
        location = location.replace(/ +(?= )/g, '');
    }

    function removeExtraWhiteSpace(text) {
        var urlRegex = /\n|\v|\r|\f/g;
        return text.replace(urlRegex, function(url) {
            return ' ';
        })
    }
    if (tweet_text && tweet_text !== "null" && tweet_text !== "undefined") {
        tweet_text = removeExtraWhiteSpace(tweet_text);
    }

    if (user_description && user_description !== "null" && user_description !== "undefined") {
        user_description = removeExtraWhiteSpace(user_description);
    }
    tweet_text = tweet_text.replace(/ +(?= )/g, '');
    var tweetObj = {
        tweet_id: tweet_id,
        tweet_id_str: tweet_id_str,
        created_at: tweet.created_at,
        name: name,
        user_id: user_id,
        screen_name: screen_name,
        location: location,
        text: tweet_text,
        language: language,
        user_description: user_description,
        followers_count: tweet.user.followers_count,
        friends_count: tweet.user.friends_count,
        profile_banner_url: tweet.user.profile_banner_url,
        statuses_count: tweet.user.statuses_count,
        profile_image_url_https: tweet.user.profile_image_url_https,
        favorites_count: tweet.user.favourites_count,
        created_at_time: tweet.user.created_at,
        utc_offset: tweet.user.utc_offset,
        time_zone: tweet.user.time_zone,
        geo_enabled: tweet.user.geo_enabled,
        geo: tweet.geo,
        coordinates: tweet.coordinates,
        place: tweet.place,
        possibly_sensitive: tweet.possibly_sensitive,
        filter_level: tweet.filter_level,
        verified: tweet.user.verified,
        RT_ID_str: RT_ID_str,
        RT_when_created: RT_when_created,
        RT_screen_name: RT_screen_name,
        RT_count: RT_count,
        source: source
    }
    return tweetObj;
}

DataCollectionHandler.prototype.liveTweetsStore = function(tweetsStore, keywordMap, loggedin_user, twtsFlag) {
    var LiveTweets = require('../models/live_tweets'),
        CustomKeywords = require('../models/custom_keywords'),
        User = require('../models/user'),
        CompanyProfile = require('../models/company_profile'),
        sharedSvc = require('../services/shared_svc.js'),
        self = this;
    if (twtsFlag === "B") {

        var bufferedTweets = sharedSvc.getBufferedTweets();
        if (bufferedTweets && bufferedTweets.length > 0) {
            tweetsStore = bufferedTweets;
        }

    } else if (twtsFlag === "R") { // 'R' remains Remaining tweets
        var balancedTweets = sharedSvc.getBalancedTweets();
        if (balancedTweets && balancedTweets.length > 0) {
            tweetsStore = balancedTweets;
        }
    }
    // var customKeywords     = new CustomKeywords();
    // customKeywords.session_id = this.sessionstorage.getItem('login_session_id')
    // customKeywords.custom_keywords = Object.keys(keywordMap)
    //
    // if(this.sessionstorage.getItem('user_dtl') !== null){
    //     customKeywords.user_id = this.sessionstorage.getItem('user_dtl').id
    // }
    var query_finder = {
        session_id: this.sessionstorage.getItem('login_session_id'),
        custom_keywords: Object.keys(keywordMap)
    }
    // if(this.sessionstorage.getItem('user_dtl') !== null){
    //     query_finder.user_id = this.sessionstorage.getItem('user_dtl').id;
    // }

    User.findOne({
        'twitter.username': loggedin_user
    }, function(err, userData) {
        if (err) {
            logger.log("error", "FileName:data_collection_handler.js, FunctionName:liveTweetsStore, Failed to get User due to the Exception = %s", err);
        } else {
            CompanyProfile.findOne({
                "user": userData._id
            }).exec(function(err, companyProfile) {
                // User.findOne({'twitter.username' : loggedin_user }).populate('companyProfile').exec(function(err, userData) {

                query_finder.user = userData._id;
                query_finder.username = userData.twitter.username;
                var data = query_finder;
                CustomKeywords.findOneAndUpdate(query_finder, data, {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true
                }, function(err, tweetKeywords) {
                    // customKeywords.save(function(err, tweetKeywords) {

                    if (err)
                        logger.log("error", "FileName:data_collection_handler.js, FunctionName:liveTweetsStore, Failed to save customKeywords due to the Exception = %s", err);
                    else {
                        logger.log("info", "Saved customKeywords Successfully.");
                        var processedTwtsStore = [];
                        tweetsStore.forEach((value) => {
                            if (twtsFlag === "B") {
                                value = self.generateBufferedTwtsObj(value);
                                value.tweets_flag = "BUFFERED_TWEETS";
                            } else if (twtsFlag === "L") {
                                value.tweets_flag = "LIVE_TWEETS";
                            } else if (twtsFlag === "R") { // 'R' remains Remaining tweets
                                value.tweets_flag = "BALANCED_TWEETS";
                            }
                            value.custom_matching_keywords = [];
                            var keywordMapKeys = tweetKeywords.custom_keywords;
                            keywordMapKeys.forEach(function(val) {
                                var matchKey = value.text.match(new RegExp(val, "gi"));
                                if (matchKey && matchKey.length > 0) {
                                    value.custom_matching_keywords.push(val);
                                }
                            })
                            value.custom_matching_keywords = (value.custom_matching_keywords.length === 0) ? ["unreliable_key"] : value.custom_matching_keywords;
                            value.custom_keywords = tweetKeywords.custom_keywords;
                            value.username = userData.twitter.username;
                            value.company_code = companyProfile.company_code;
                            value.division_code = companyProfile.division_code;
                            var tweet_created_date = new Date(value.created_at)
                            value.created_at = new Date(tweet_created_date.getFullYear(), tweet_created_date.getMonth(), tweet_created_date.getDate())
                            processedTwtsStore.push(value);
                        });

                        if (twtsFlag === "B") {
                            logger.log("info", "Total BufferedTweets Array Count: %s", processedTwtsStore.length)
                        } else if (twtsFlag === "L") {
                            logger.log("info", "Total LiveTweets Array Count according to tweets storage limit: %s", processedTwtsStore.length)
                        } else if (twtsFlag === "R") {
                            logger.log("info", "Total BalancedTweets Array Count: %s", processedTwtsStore.length)
                        }
                        LiveTweets.collection.insert(processedTwtsStore, function(err, liveTwtsData) {

                            if (err) {
                                logger.log("error", "FileName:data_collection_handler.js, FunctionName:liveTweetsStore, Failed to save liveTweets/BufferedTweets due to the Exception = %s", err);
                            } else {
                                logger.log("info", "Saved liveTweets/Buffered Successfully.");
                            }
                        });
                    }

                });

            });
        }


    });
}

DataCollectionHandler.prototype.liveTweetsActionStore = function(twts_act_obj, socket, logger) {
    var data = twts_act_obj;

    LiveTwtsUserActions.findOne({
        'tweet_id': data.tweet_id
    }, function(err, liveTweetsActions) {

        if (err) {
            logger.log('error', 'Found Exception at Function[liveTweetsActionStore] : %s', err);
        } else if (liveTweetsActions) {
            liveTweetsActions.actions.is_important = (data.actions.is_important) ? data.actions.is_important : liveTweetsActions.actions.is_important;
            liveTweetsActions.actions.category = (data.actions.category) ? data.actions.category : liveTweetsActions.actions.category;
            liveTweetsActions.actions.classification = (data.actions.classification) ? data.actions.classification : liveTweetsActions.actions.classification;
            liveTweetsActions.actions.users = (data.actions.users) ? data.actions.users : liveTweetsActions.actions.users;
            liveTweetsActions.save()
            logger.log('info', 'Updated Live Tweets user action successfully');
            // socket.emit('alertbar', 'Updated Live Tweets user action successfully')
        } else {
            var liveTwtsModelCls = new LiveTwtsUserActions(data);
            liveTwtsModelCls.save(function(err, result) {
                if (err) {
                    logger.log('error', 'Found Exception at Function[liveTweetsActionStore] : %s', err);
                } else {
                    logger.log('info', 'Saved Live Tweets user action successfully');
                    socket.emit('alertbar', 'Saved Live Tweets user action successfully')
                }
            });
            // socket.emit('alertbar', 'Saved Live Tweets user action successfully')
        }
    });
    // LiveTwtsUserActions.findOneAndUpdate({'tweet_id': data.tweet_id}, data,{ upsert: true, new: true, setDefaultsOnInsert: true },function (err, liveTweetsActions) {
    //     if (err){
    //        logger.log('error', 'Found Exception at Function[liveTweetsActionStore] : %s', err);
    //     }
    //     else{
    //         logger.log('info', 'Saved Live Tweets user action successfully');
    //         // socket.emit('alertbar', 'Saved Live Tweets user action successfully')
    //     }
    // });
}

DataCollectionHandler.prototype.getAllUsers = function(socket, logger) {
    var User = require('../models/user');
    User.find(function(err, data) {
        if (err) {
            logger.log('error', 'Found Exception at Function[getAllUsers] : %s', err);
        } else {
            logger.log('info', 'Fetched all users successfully');
            socket.emit("collect_all_users", data);
        }

    });
}
// DataCollectionHandler.prototype.getCustomKeywords = function(socket, logger, loggedin_user) {
//     var User = require('../models/user');
//     var CustomKeywords = require('../models/custom_keywords');
//     User.findOne({
//         'twitter.username': loggedin_user
//     }, function(err, userData) {
//         if (err) {
//             logger.error('error', 'User Not Found due to the Exception: %s', err);
//         } else {
//             CustomKeywords.find({
//                 'user': userData._id
//             }).exec(function(err, custKeyData) {
//                 if (err) {
//                     logger.error('error', 'CustomKeywords Not Found due to the Exception: %s', err);
//                 } else {
//                     var customSearckKeys = []
//                     custKeyData.forEach(function(obj) {
//                         obj.custom_keywords.forEach(function(val) {
//                             customSearckKeys.push({
//                                 label: val
//                             })
//                         })
//                     })
//                     if (customSearckKeys.length > 0) {
//                         socket.emit("custom_keys", customSearckKeys);
//                     }
//                 }
//             });
//         }
//     });
// }

DataCollectionHandler.prototype.getCustomKeywords = function(req, res) {
    var User = require('../models/user');
    var CustomKeywords = require('../models/custom_keywords');
    let queryParam= req.query;
    let inputParam= {};
     
    if(queryParam.flag === "DATEWISE"){
        let date_range= JSON.parse(queryParam.dateRange);
        if (date_range && date_range['startDate']) {
            var startDate = new Date(date_range['startDate']),
                endDate = new Date(date_range['endDate']);
            inputParam['createdAt'] = {
                $gte: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()),
                $lte: new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(),23,59,59)// 23=hours, 59=minutes,59=seconds Using this to include current date
            }
        }
    }    
    else if(queryParam.flag === "SESSIONWISE"){
        let sessionIdList= (queryParam.sessionIdList)?queryParam.sessionIdList: [];
        inputParam['session_id']= {"$in": (queryParam.sessionIdList)?queryParam.sessionIdList.split(","): []};
    }
    User.findOne({
        'twitter.username': loginUserDtls.username
    }, (err, userData) =>{
        if (err) {
            logger.error('error', 'User Not Found due to the Exception: %s', err);
        } else {      
            inputParam['user']= userData._id      
            CustomKeywords.find(inputParam).exec((err, custKeyData) =>{
                if (err) {
                    logger.error('error', 'CustomKeywords Not Found due to the Exception: %s', err);
                    res.json({
                        "status": "error"
                    });
                } else {
                    var customSearckKeys = []
                    custKeyData.forEach(function(obj) {
                        obj.custom_keywords.forEach(function(val) {
                            customSearckKeys.push({
                                label: val
                            })
                        })
                    })            
                    res.json({
                        "status": "success",
                        "data": customSearckKeys
                    });
                }
            });
        }
    });
}
DataCollectionHandler.prototype.getCustomKeywordSessions = function(req, res) {
    var User = require('../models/user');
    var CustomKeywords = require('../models/custom_keywords');

    let queryParam= req.query;
    let $matchFilter= {};
    let date_range= (queryParam.dateRange)?JSON.parse(queryParam.dateRange):queryParam.dateRange;
    if (date_range && date_range['startDate']) {
        var startDate = new Date(date_range['startDate']),
            endDate = new Date(date_range['endDate']);
            $matchFilter['createdAt'] = {
            $gte: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()),
            $lte: new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(),23,59,59)// 23=hours, 59=minutes,59=seconds Using this to include current date
        }
    }
    
    
    // User.findOne({
    //     'twitter.username': loginUserDtls.username
    // }, (err, userData) =>{
    //     if (err) {
    //         logger.error('error', 'User Not Found due to the Exception: %s', err);
    //     } else {     
            
    //     }
    // });
    $matchFilter["username"]= loginUserDtls.username;
    $matchFilter["session_id"]= {$ne:null}; //It helps to avoid record with null session_id
            let findQuery= [     
                {$match: $matchFilter},           
                {
                    $project:{
                        createdAt:{
                          $dateToString:
                          {format:"%Y-%m-%d", date:"$createdAt"}
                        },
                        session_id:"$session_id",
                        username: "$username"
                      }
                },
                {
                    $group :
                      {
                        _id : "$createdAt", groupObj: { $push: "$$ROOT" }
                      }
                }                
            ];
            console.log("Aswin Check input:", findQuery)
            CustomKeywords.aggregate(findQuery).exec((err, custKeyData) =>{
                if (err) {
                    logger.error('error', 'CustomKeywords Not Found due to the Exception: %s', err);
                    res.json({
                        "status": "error"
                    });
                } else {
                    var customSearchKeySessions = [], optgroups= [];
                    custKeyData.forEach(function(obj) {
                        optgroups.push({"createdAt": obj._id}); // This id for grouping in dropdown selectize.js                        
                        let sessionCnt=1;    
                        let groupObj= _.uniq(obj.groupObj,"session_id");
                        groupObj.forEach((val)=>{
                            let temp= {};
                            temp.createdAt= val.createdAt;
                            temp.session_id= val.session_id;                            
                            temp.sessionName= "Session"+ sessionCnt;
                            temp.session_order_id= sessionCnt;
                            customSearchKeySessions.push(temp);
                            sessionCnt++;
                            
                        })
                        
                    })   
                    // customSearchKeySessions.unshift({createdAt:"", session_id:"all_keyword", sessionName:"All Keywords"})         
                    res.json({
                        "status": "success",
                        "data": {"options":customSearchKeySessions, "optgroups": optgroups}
                    });
                }
            })
}
DataCollectionHandler.prototype.getLiveTweetsHistory = function(req, res) {
    try {
        var User = require('../models/user');
        var CustomKeywords = require('../models/custom_keywords');
        var LiveTweets = require('../models/live_tweets');
        var loggedin_user = (req.user) ? req.user.twitter.username : null;
        var mongoose = require('mongoose');
        var queryParams = req.query;
        User.findOne({
            'twitter.username': loggedin_user
        }, function(err, userData) {
            if (err) {
                logger.log('error', 'User Not Found due to the Exception: %s', err);
            } else {
                data_col_mixin.getLiveTweets(userData, queryParams).then(function(data) {
                    res.json(data)
                });
                // CustomKeywords.find(customKeywordsFilter,function(err, custKeyData) {
                //
                //     var mongoose = require('mongoose');
                //     if (err){
                //         logger.error('error', 'CustomKeywords Not Found due to the Exception: %s', err);
                //     }
                //     else{
                //         data_col_mixin.getLiveTweets(custKeyData, queryParams).then(function(data){
                //            res.json(data)
                //         })
                //         //
                //         // LiveTweets.find({'screen_name' :'BhaktBusters'},function(err, liveTwtsData) {
                //         //
                //         //     if (err){
                //         //         logger.error('error', 'LiveTweets Not Found due to the Exception: %s', err);
                //         //     }
                //         //     else{
                //         //
                //         //     }
                //         // });
                //     }
                // });
            }
        });
    } catch (ex) {
        logger.log('error', 'Exception: %s', userErr, {
            "fileName": "data_collection_handler.js",
            "apiName": "live_twts_data",
            "FnName": "getLiveTweetsHistory"
        });
    }
};

DataCollectionHandler.prototype.updateTwtsHstryActions = function(req, res) {
    var data = req.body;

    LiveTweets.findOne({
        'tweet_id_str': data.tweet_id_str
    }, function(err, tweetsActions) {

        if (err) {
            logger.log('error', 'Exception: %s', err, {
                "fileName": "data_collection_handler.js",
                "mongoModelName": "LiveTweets",
                "apiName": "updateTwtsHstryActions",
                "FnName": "updateTwtsHstryActions"
            });
        } else if (tweetsActions && data && data.actions) {
            if (!tweetsActions.actions) {
                tweetsActions.actions = {}
            }
            tweetsActions.actions.is_important = (data.actions.is_important) ? data.actions.is_important : tweetsActions.actions.is_important;
            tweetsActions.actions.category = (data.actions.category) ? data.actions.category : tweetsActions.actions.category;
            tweetsActions.actions.classification = (data.actions.classification) ? data.actions.classification : tweetsActions.actions.classification;
            tweetsActions.actions.users = (data.actions.users) ? data.actions.users : tweetsActions.actions.users;
            tweetsActions.save()
            logger.log('info', 'Updated History Tweets user action successfully');
            res.json({
                "status": "success"
            })
        }
    });
}
DataCollectionHandler.prototype.getAllUsersAPI = function(req, res) {
    var User = require('../models/user');
    User.find(function(err, users) {
        if (err) {
            logger.log('error', 'Exception: %s', err, {
                "fileName": "data_collection_handler.js",
                "mongoModelName": "User",
                "apiName": "getAllUsers",
                "FnName": "getAllUsersAPI"
            });
            res.json({
                "status": "error"
            })
        } else {
            logger.log('info', 'FileName:data_collection_handler.js,FnName:getAllUsersAPI,ApiName: getAllUsers,  Fetched all users successfully');
            res.json({
                "status": "success",
                "data": users
            })
        }

    });
}
DataCollectionHandler.prototype.storeTopKeywords = function() {
    var TopKeywordsModal = require('../models/top_keywords'),
        sharedSvc = require('../services/shared_svc.js');
    var tmpMap = sharedSvc.getTopKeywords() || [];
    var topTwtsKeywordStore = [];
    let createdAt = new Date();
    tmpMap.forEach((item)=> {
            var temp = {
                name: item.name,
                size: item.size,
                weight: item.weight,
                tweet: item.tweet,
                username: loginUserDtls.username,
                session_id: this.sessionstorage.getItem('login_session_id'),
                createdAt
            }
            topTwtsKeywordStore.push(temp);
    })
    if (topTwtsKeywordStore.length > 0) {
        TopKeywordsModal.collection.insert(topTwtsKeywordStore, function(err, data) {
            if (err) {
                logger.log("error", "FileName:data_collection_handler.js, FunctionName:storeTopKeywordsFile, Failed to save topKeywords due to the Exception = %s", err);
            } else {
                logger.log("info", "Saved top keywords Successfully.");
            }
        });
    } else {
        logger.log("info", "No Top Keyword exists", {
            "fnName": "storeTopKeywordsFile"
        })
    }
}

DataCollectionHandler.prototype.storeTopHashtags = function() {
    var TopHashtagsModal = require('../models/top_hashtags'),
        sharedSvc = require('../services/shared_svc.js');
    var tmpMap = sharedSvc.getTopHashtags() || [];
    var topTwtsHashtagStore = [];
    let createdAt = new Date();
    tmpMap.forEach((item)=> {
            var temp = {
                name: item.name,
                size: item.size,
                weight: item.weight,
                tweet: item.tweet,
                username: loginUserDtls.username,
                session_id: this.sessionstorage.getItem('login_session_id'),
                createdAt
            }
            topTwtsHashtagStore.push(temp);
    })
    if (topTwtsHashtagStore.length > 0) {
        TopHashtagsModal.collection.insert(topTwtsHashtagStore, function(err, data) {
            if (err) {
                logger.log("error", "FileName:data_collection_handler.js, FunctionName:storeTopHashtagsFile, Failed to save Hashtags due to the Exception = %s", err);
            } else {
                logger.log("info", "Saved top Hashtags Successfully.");
            }
        });
    } else {
        logger.log("info", "No Top Hashtags exists", {
            "fnName": "storeTopHashtagsFile"
        })
    }
}

DataCollectionHandler.prototype.storeTopKMostInfluentialUsers = function() {
    var sharedSvc = require('../services/shared_svc.js');
    var TopMostInfluentialUsersModal = require('../models/top_most_influential_users');
    var influentialUsersFBHeap = sharedSvc.getInfluentialUsersFBHeap()
    if (influentialUsersFBHeap) {
        influentialUsersFBHeap = influentialUsersFBHeap.influentialUsersFBHeap;
        var TopKUsersTemp = [];
        //console.log("File Start influential users------------------------------------------------------");
        let createdAt = new Date();
        while (!influentialUsersFBHeap.isEmpty()) {
            var tmpRecord = influentialUsersFBHeap.extractMinimum();
            tmpRecord = tmpRecord.value;
            var temp = {
                name: tmpRecord.name,
                screen_name: tmpRecord.screen_name,
                statuses_count: tmpRecord.statuses_count,
                followers_count: tmpRecord.followers_count,

                profile_banner_url: tmpRecord.profile_banner_url,
                profile_image_url_https: tmpRecord.profile_image_url_https,
                last_refreshed: tmpRecord.last_refreshed,
                friends_count: tmpRecord.friends_count,
                user_id: tmpRecord.user_id,

                username: loginUserDtls.username,
                session_id: this.sessionstorage.getItem('login_session_id'),
                createdAt
            }
            TopKUsersTemp.push(temp);
        }
        if (TopKUsersTemp.length > 0) {
            TopMostInfluentialUsersModal.collection.insert(TopKUsersTemp, function(err, data) {

                if (err) {
                    logger.log("error", "FileName:data_collection_handler.js, FunctionName:storeTopKMostInfluentialUsers, Failed to save Top Influential Users due to the Exception = %s", err);
                } else {
                    logger.log("info", "Saved Top Influential Users Successfully.");
                }
            });

        } else {
            logger.log("info", "No Top Influential Users exists", {
                "fnName": "storeTopKMostInfluentialUsers"
            });
        }
    } else {
        logger.log("info", "No Top Influential Users exists", {
            "fnName": "storeTopKMostInfluentialUsers"
        });
    }
}

DataCollectionHandler.prototype.storeTopKMostActiveUsers = function() {
    var sharedSvc = require('../services/shared_svc.js');
    var TopMostActiveUsersModal = require('../models/top_most_active_users');
    var activeUsersFBHeap = sharedSvc.getActiveUsersFBHeap();
    if (activeUsersFBHeap) {
        activeUsersFBHeap = activeUsersFBHeap.activeUsersFBHeap;
        var TopKUsersTemp = [];
        let createdAt = new Date();
        while (!activeUsersFBHeap.isEmpty()) {
            var tmpRecord = activeUsersFBHeap.extractMinimum();
            tmpRecord = tmpRecord.value;
            var temp = {
                name: tmpRecord.name,
                screen_name: tmpRecord.screen_name,
                statuses_count: tmpRecord.statuses_count,
                followers_count: tmpRecord.followers_count,
                
                profile_banner_url: tmpRecord.profile_banner_url,
                profile_image_url_https: tmpRecord.profile_image_url_https,
                last_refreshed: tmpRecord.last_refreshed,
                friends_count: tmpRecord.friends_count,
                user_id: tmpRecord.user_id,

                username: loginUserDtls.username,
                session_id: this.sessionstorage.getItem('login_session_id'),
                createdAt
            }
            TopKUsersTemp.push(temp);
        }
        if (TopKUsersTemp.length > 0) {
            TopMostActiveUsersModal.collection.insert(TopKUsersTemp, function(err, data) {

                if (err) {
                    logger.log("error", "FileName:data_collection_handler.js, FunctionName:storeTopKMostActiveUsers, Failed to save Top Active Users due to the Exception = %s", err);
                } else {
                    logger.log("info", "Saved Top Active Users Successfully.");
                }
            });

        } else {
            logger.log("info", "No Top Active Users exists", {
                "fnName": "storeTopKMostActiveUsers"
            });
        }
    } else {
        logger.log("info", "No Top Active Users exists", {
            "fnName": "storeTopKMostActiveUsers"
        });
    }
}

DataCollectionHandler.prototype.storeTopKMaxReTweets = function() {
    var sharedSvc = require('../services/shared_svc.js');
    var TopMaxRetweetsModal = require('../models/top_max_retweets');
    var topRetweetsFBHeap = sharedSvc.getTopRetweetsFBHeap();
    if (topRetweetsFBHeap) {
        topRetweetsFBHeap = topRetweetsFBHeap.topRetweetsFBHeap;
        var TopKMaxReTweets = [];
        let createdAt = new Date();
        while (!topRetweetsFBHeap.isEmpty()) {
            var tmpRecord = topRetweetsFBHeap.extractMinimum();
            tmpRecord = tmpRecord.value;
            var temp = {
                retweet_id: tmpRecord.retweet_id,
                retweet_id_str: tmpRecord.retweet_id_str,
                retweet_user_name: tmpRecord.retweet_user_name,
                retweet_user_screen_name: tmpRecord.retweet_user_screen_name,
                retweet_user_profile_image_url_https: tmpRecord.retweet_user_profile_image_url_https,
                retweet_user_location: tmpRecord.retweet_user_location,
                retweet_count: tmpRecord.retweet_count,
                retweet_text: tmpRecord.retweet_text,
                username: loginUserDtls.username,
                session_id: this.sessionstorage.getItem('login_session_id'),
                createdAt
            }
            TopKMaxReTweets.push(temp);
        }
        if (TopKMaxReTweets.length > 0) {
            TopMaxRetweetsModal.collection.insert(TopKMaxReTweets, function(err, data) {

                if (err) {
                    logger.log("error", "FileName:data_collection_handler.js, FunctionName:storeTopKMaxReTweets, Failed to save Top Keyword Maximum Retweets due to the Exception = %s", err);
                } else {
                    logger.log("info", "Saved Top Keyword Maximum Retweets Successfully.");
                }
            });

        } else {
            logger.log("info", "No Top Keyword Maximum Retweets exists", {
                "fnName": "storeTopKMaxReTweets"
            });
        }
    } else {
        logger.log("info", "No Top Keyword Maximum Retweets exists", {
            "fnName": "storeTopKMaxReTweets"
        });
    }
}

DataCollectionHandler.prototype.storeFullReTweets = function() {
    var fullRetweetsModal = require('../models/full_retweets');
    var sharedSvc = require('../services/shared_svc.js');
    var retweetsArray = sharedSvc.getFullReTweets();

    if (retweetsArray && retweetsArray.length > 0) {
        fullRetweetsModal.collection.insert(retweetsArray, function(err, data) {

            if (err) {
                logger.log("error", "FileName:data_collection_handler.js, FunctionName:storeFullReTweets, Failed to save Full Retweets due to the Exception = %s", err);
            } else {
                logger.log("info", "Saved Full Retweets Successfully.");
            }
        });

    } else {
        logger.log("info", "No Retweets exists", {
            "fnName": "storeFullReTweets"
        });
    }
}
DataCollectionHandler.prototype.storePosTweets = function() {
    var positiveTweetsModal = require('../models/positive_tweets');
    var sharedSvc = require('../services/shared_svc.js');
    var posTweetsArray = sharedSvc.getPosTweets();

    var tmpTwtsArr = [];
    if (posTweetsArray && posTweetsArray.length > 0) {
        var login_session_id = this.sessionstorage.getItem('login_session_id');
        posTweetsArray.forEach(function(val) {
            var tmp = {
                profile_image_url_https: val.profile_image_url_https,
                screen_name: val.screen_name,
                language: (val.meta && val.meta.language) ? val.meta.language : null,
                name: val.name,
                location: val.location,
                text: val.text,
                polarity: val.polarity,
                username: loginUserDtls.username,
                session_id: login_session_id
            }
            tmpTwtsArr.push(tmp);
        });

        positiveTweetsModal.collection.insert(tmpTwtsArr, function(err, data) {

            if (err) {
                logger.log("error", "FileName:data_collection_handler.js, FunctionName:storePosTweets, Failed to save positive tweets due to the Exception = %s", err);
            } else {
                logger.log("info", "Saved all positive tweets Successfully.");
            }
        });

    } else {
        logger.log("info", "No positive tweets exists", {
            "fnName": "storePosTweets"
        });
    }
}

DataCollectionHandler.prototype.storeNegTweets = function() {
    var negativeTweetsModal = require('../models/negative_tweets');
    var sharedSvc = require('../services/shared_svc.js');
    var negTweetsArray = sharedSvc.getNegTweets();

    var tmpTwtsArr = [];
    if (negTweetsArray && negTweetsArray.length > 0) {
        var login_session_id = this.sessionstorage.getItem('login_session_id');
        negTweetsArray.forEach(function(val) {
            var tmp = {
                profile_image_url_https: val.profile_image_url_https,
                screen_name: val.screen_name,
                language: (val.meta && val.meta.language) ? val.meta.language : null,
                name: val.name,
                location: val.location,
                text: val.text,
                polarity: val.polarity,
                username: loginUserDtls.username,
                session_id: login_session_id
            }
            tmpTwtsArr.push(tmp);
        });

        negativeTweetsModal.collection.insert(tmpTwtsArr, function(err, data) {

            if (err) {
                logger.log("error", "FileName:data_collection_handler.js, FunctionName:storeNegTweets, Failed to save negative tweets due to the Exception = %s", err);
            } else {
                logger.log("info", "Saved all negative tweets Successfully.");
            }
        });

    } else {
        logger.log("info", "No negative tweets exists", {
            "fnName": "storeNegTweets"
        });
    }
}


DataCollectionHandler.prototype.savePaymentDetails = function(req, res) {
    var paymentModal = require('../models/payment'),
        CompanyProfile = require('../models/company_profile'),
        User = require('../models/user');
    var loggedin_user = req.user.twitter.username;
    var postData = req.body;
    var data = {
        username: loggedin_user,
        billing_postal_code: postData.cardData.billing_postal_code,
        card_brand: postData.cardData.card_brand,
        exp_date: {
            "month": postData.cardData.exp_month,
            "year": postData.cardData.exp_year
        },
        card_last_4_digit: postData.cardData.last_4,
        transactionStatus: postData.transactionStatus
    }
    var query_finder = {
        username: loggedin_user
    }
    User.findOne({
        'twitter.username': loggedin_user
    }).populate('companyProfile').exec(function(userErr, userData) {
        if (userErr) {
            logger.log('error', 'User Not Found due to the Exception: %s', userErr);
        } else {
            CompanyProfile.findOneAndUpdate({
                'user': userData._id
            }, {
                "status": "COMPLETE"
            }, {
                upsert: true
            }, function(err, result) {
                if (err) {
                    logger.log('error', 'CompanyProfile Not Found due to the Exception: %s', err, {
                        "fileName": "data_collection_handler.js",
                        "mongoModelName": "CompanyProfile",
                        "apiName": "save-reg-form"
                    });
                } else {
                    logger.log('info', 'Updated Status for Company Profile for Enterprise license successfully');
                }
            });
        }
    })

    paymentModal.findOneAndUpdate(query_finder, data, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
    }, function(err, result) {
        if (err) {
            logger.log('error', 'Found Exception : %s', err, {
                "fnName": "savePaymentDetails"
            });
            res.json({
                "status": "error"
            })
        } else {
            res.json({
                "status": "success",
                "result": result
            });
            logger.log('info', 'Saved Payment Details successfully');
        }
    });

}
DataCollectionHandler.prototype.getTopKeyword = function(req, res) {
    var TopKeywordsModal = require('../models/top_keywords');
    let queryParam= req.query;    
    let date_range= (queryParam.dateRange)?JSON.parse(queryParam.dateRange):queryParam.dateRange;

    let inputParam= {};
    if (date_range && date_range['startDate']) {
        var startDate = new Date(date_range['startDate']),
            endDate = new Date(date_range['endDate']);
            inputParam['createdAt'] = getDateRangeAt(startDate, endDate);
    }
    inputParam['username']= loginUserDtls.username;

    TopKeywordsModal.find(inputParam).sort({size:-1}).limit(100) .exec(function(err, data) {
        if (err) {
            logger.error('error', 'TopKeywords Not Found due to the Exception: %s', err);
            res.json({
                "status": "error"
            });
        } else {
            res.json({
                "status": "success",
                "data": data
            });
        }
    });    
}   
DataCollectionHandler.prototype.getTopHashtag = function(req, res) {
    var TopHashtagModal = require('../models/top_hashtags');
    let queryParam= req.query;    
    let date_range= (queryParam.dateRange)?JSON.parse(queryParam.dateRange):queryParam.dateRange;

    let inputParam= {};
    if (date_range && date_range['startDate']) {
        var startDate = new Date(date_range['startDate']),
            endDate = new Date(date_range['endDate']);
            inputParam['createdAt'] = getDateRangeAt(startDate, endDate);
    }
    inputParam['username']= loginUserDtls.username;
    TopHashtagModal.find(inputParam).sort({size:-1}).limit(100) .exec(function(err, data) {
        if (err) {
            logger.error('error', 'TopHashtag Not Found due to the Exception: %s', err);
            res.json({
                "status": "error"
            });
        } else {
            res.json({
                "status": "success",
                "data": data
            });
        }
    });    
}   

DataCollectionHandler.prototype.getInfluentialUsers = function(req, res) {
    var influentialUsersModal = require('../models/top_most_influential_users');
    let queryParam= req.query;    
    let date_range= (queryParam.dateRange)?JSON.parse(queryParam.dateRange):queryParam.dateRange,
        skip= parseInt(queryParam.skip), limit= parseInt(queryParam.limit);        
    let inputParam= {};
    if (date_range && date_range['startDate']) {
        var startDate = new Date(date_range['startDate']),
            endDate = new Date(date_range['endDate']);
            inputParam['createdAt'] = getDateRangeAt(startDate, endDate);
    }    
    inputParam['username']= loginUserDtls.username;
    influentialUsersModal.find(inputParam).sort({followers_count:-1}).skip(skip).limit(limit).exec(function(err, data) {
        if (err) {
            logger.error('error', 'InfluentialUsers Not Found due to the Exception: %s', err);
            res.json({
                "status": "error"
            });
        } else {
            res.json({
                "status": "success",
                "data": data
            });
        }
    });    
} 
DataCollectionHandler.prototype.getActiveUsers = function(req, res) {
    var activeUsersModal = require('../models/top_most_active_users');
    let queryParam= req.query;    
    let date_range= (queryParam.dateRange)?JSON.parse(queryParam.dateRange):queryParam.dateRange,
        skip= parseInt(queryParam.skip), limit= parseInt(queryParam.limit);
    let inputParam= {};
    if (date_range && date_range['startDate']) {
        var startDate = new Date(date_range['startDate']),
            endDate = new Date(date_range['endDate']);
            inputParam['createdAt'] = getDateRangeAt(startDate, endDate);
    }
    inputParam['username']= loginUserDtls.username;
    activeUsersModal.find(inputParam).sort({statuses_count:-1}).skip(skip).limit(limit).exec(function(err, data) {
        if (err) {
            logger.error('error', 'ActiveUsers Not Found due to the Exception: %s', err);
            res.json({
                "status": "error"
            });
        } else {
            res.json({
                "status": "success",
                "data": data
            });
        }
    });    
} 


DataCollectionHandler.prototype.tweetsDownload = function(socket, inputData, realPath) {
    var LiveTweets = require('../models/live_tweets');

    var date_range = inputData['date_range'];
    var custom_keys = inputData['custom_keys'];
    var session_ids = inputData['session_ids']; //From SessionWIse Tab
    var username = loginUserDtls.username;

    var $matchFilter = {}, isParamPresents = false;
    $matchFilter['username'] = username;
    if (date_range && date_range['startDate']) {
        var startDate = new Date(date_range['startDate']),
            endDate = new Date(date_range['endDate']);
        $matchFilter['created_at'] = {
            $gte: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()),
            $lte: new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() ,23,59,59)
        }
        isParamPresents = true;
    }
    if (custom_keys && custom_keys.length > 0) {
        custom_keys.push("unreliable_key");
        $matchFilter['custom_matching_keywords'] = {
            $in: custom_keys
        }
        isParamPresents = true;
    }  
    if (session_ids && session_ids.length > 0) {    
        $matchFilter['session_id'] = {
            $in: session_ids.map(x=>parseInt(x))
        }
        isParamPresents = true;
    }  
    const findQuery = [{
            $match: $matchFilter
        },
        // {$limit: 25000}
    ];
    console.log(findQuery)    

    if(isParamPresents){        
        LiveTweets.aggregate(findQuery).exec(function(err, data){
            if (err) {
                logger.error('error', 'Download: LiveTweets Not Found due to the Exception: %s', err);
                res.json({
                    "status": "error"
                });
            } else {
                if (data && data.length>0) {
                    var live_twt_data = data;
                    var currentdate = new Date();
                    var datetime = currentdate.getDate() + "-" +
                        (currentdate.getMonth() + 1) + "-" +
                        currentdate.getFullYear() + "-" +
                        currentdate.getHours() + "-" +
                        currentdate.getMinutes() + "-" +
                        currentdate.getSeconds();
    
                    var filename = loginUserDtls.username + '_live_tweets_history_' + datetime + '.xls';
                    var options = {
                        encoding: 'utf8'
                    };
                    var fs = require('fs');
                    var writerStream = fs.createWriteStream(realPath + '/public/media/files/tweets_hist/' + filename, options);

                    var nRow = live_twt_data.length + 1;
                    var row1 = "Name" + "\t" + "Screen Name"+ "\t" + "Custom Keyword"+ "\t" + "Tweet" + "\t" + "Number of followers" + "\t" + "Number of following"+ "\t"+ "Twitter Profile" + "\n";
                    writerStream.on("open", function() {
                        for (var i = 2; i <= nRow; i++) {
                            let custom_matching_keywords= (live_twt_data[i - 2].custom_matching_keywords && data.includes("unreliable_key"))?live_twt_data[i - 2].custom_keywords.join(","): live_twt_data[i - 2].custom_matching_keywords.join(",")
                            
                            row1 += live_twt_data[i - 2].name + "\t" + live_twt_data[i - 2].screen_name + "\t" + custom_matching_keywords + "\t" + live_twt_data[i - 2].text + "\t" + live_twt_data[i - 2].followers_count + "\t" + live_twt_data[i - 2].friends_count + "\t" + "https://twitter.com/" + live_twt_data[i - 2].screen_name + "\n";
                        }
                        writerStream.write(row1);
                        writerStream.end();
                    });
    
    
                    // Handle stream events --> finish, and error
                    writerStream.on('finish', function() {
                        console.log("Write completed.");                        
                        var download_path = app_config.protocol + '://' + app_config.node_machine + app_config.static_url + app_config.download_path + '/tweets_hist/' + filename;
                        logger.log("info", "FileName:data_collection_handler.js, FunctionName:tweetsDownload, Downloaded successfully, FilePath = %s", download_path);
                        debugger
                        socket.emit('histTweetsDownload', filename, download_path);
                    });
    
                    writerStream.on('error', function(err) {
                        debugger
                        console.log(err);
                        logger.log("error", "FileName:data_collection_handler.js, FunctionName:tweetsDownload, Failed to get User due to the Exception = %s", err);
                        socket.emit('histTweetsDownloadError', err);
                    });
                } else {
                    debugger
                    socket.emit('histTweetsDownload', null, null);
                }
            }            
        });
        
    }
}

DataCollectionHandler.prototype.getPeliasMapData = function(ch, msg) {
    var mapMarkerData = sharedSvc.getMapCoordinates();
    if(mapMarkerData){
        let session_id = this.sessionstorage.getItem('login_session_id')
        getMapCoordinates(mapMarkerData, session_id, ch, msg);
    }
}
async function getMapCoordinates(mapMarkerData, session_id,  ch, msg) {
    try {
        var MapStoreModel = require('../models/temp_map_store');
        let pelias_host = appSettings["appConfig"]["pelias_machine"];
        let peliasApiUri = encodeURI(`${pelias_host}/v1/autocomplete?text=${mapMarkerData.location}`); 
        const response = await axios.get(peliasApiUri);
        if(response.status === 200 && response.data["features"].length>0){
            let features = response.data["features"][0];

            mapMarkerData.lat = features.geometry.coordinates[1];
            mapMarkerData.lng = features.geometry.coordinates[0];
            mapMarkerData.username = loginUserDtls.username;
            mapMarkerData.session_id = session_id;
            MapStoreModel.create(mapMarkerData, function (err, doc) {
                if (err) {
                    logger.log("error", "FileName:data_collection_handler.js, FunctionName:getMapCoordinates, Failed to save Geo Coordinates due to the Exception = %s", err);
                } else {
                    logger.log("info", "Saved Geo Coordinates Successfully.");
                }                
            });
            // socket.emit("getPeliasMap", mapData);
        }
    } catch (error) {
        console.error(error);
        logger.log('error', 'Sorry, there seems to be an issue with the connection!');
        logger.log("error", 'FileName:routes.js, Exception at getMapCoordinates function::%s', error)
    }
}

DataCollectionHandler.prototype.tempMapChangeStream = function(socket) {
    var MapStoreModel = require('../models/temp_map_store');
    const pipeline = [
        { $match: { 'fullDocument.username': loginUserDtls.username }},
    ];
    const changeStream = MapStoreModel.watch(pipeline);
    changeStream.on('change', (next) => {
        let streamingData = next.fullDocument;
        socket.emit("getPeliasMap", streamingData);
    });
}
DataCollectionHandler.prototype.deleteTempMapStore = function(ch, msg) {
    var MapStoreModel = require('../models/temp_map_store');
    if(loginUserDtls){
        MapStoreModel.deleteMany({ username: loginUserDtls.username }, function(err, data) {
            if (err) {
                logger.log('error', 'Found Exception at Function[deleteTempMapStore] : %s', err);
            } else {
                logger.log('info', 'Deleted Entire current session records from temp_map_store collection.');
            }        
        });
    }    
}
DataCollectionHandler.prototype.getAuditLogDetails = function(req, res) {
    try {
        var User = require('../models/user');
        var UserAuditLog = require('../models/user_audit_log');
        var loggedin_user = (req.user) ? req.user.twitter.username : null;

        
        User.findOne({
            'twitter.username': loggedin_user
        }, function(err, userData) {
            if (err) {
                logger.log('error', 'User Not Found due to the Exception: %s', err);
            } else {
                var queryParams = req.query;
                var recordLength = parseInt(queryParams['length']);
                var offset = parseInt(queryParams['start']);                
                
                let inputParam = {};
                inputParam['user']= userData._id  
                const findQuery = [{
                    $match: inputParam
                },
                {
                    $facet: {
                        metadata: [{
                            $count: "recordsTotal"
                        }, {
                            $addFields: {
                                page: 1
                            }
                        }],
                        data: [{
                            $skip: offset
                        }, {
                            $limit: recordLength
                        }] // add projection here wish you re-shape the docs
                    }
                }
            ];

            UserAuditLog.aggregate(findQuery).exec((err, streamData) =>{
                if (err) {
                    logger.log("error", "FileName:data_collection_handler.js, FunctionName:getAuditLogDetails, Failed to get User due to the Exception = %s", err);
                }
                else{
                    var responseData = streamData[0];
                    if (responseData) {
                        var live_twt_data = responseData.data;
                        let dataSet = {
                            'draw': auditDtDrawCount++,
                            'recordsFiltered': (responseData.metadata[0]) ? responseData.metadata[0].recordsTotal : 10,
                            'recordsTotal': (responseData.metadata[0]) ? responseData.metadata[0].recordsTotal : 0,
                            'data': live_twt_data
                        };
                        res.json(dataSet);
                    } else {
                        let dataSet = {
                            'draw': 1,
                            'recordsFiltered': 0,
                            'recordsTotal': 0,
                            'data': []
                        };
                        res.json(dataSet);
                    }
                }                

            });
            }
        });
    } catch (ex) {
        logger.log('error', 'Exception: %s', userErr, {
            "fileName": "data_collection_handler.js",
            "apiName": "audit_logs_data",
            "FnName": "getAuditLogDetails"
        });
    }
};
module.exports = DataCollectionHandler

function getDateRangeAt(startDate, endDate){
    return {
        $gte: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()),
        $lte: new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(),23,59,59)// 23=hours, 59=minutes,59=seconds Using this to include current date
    }
}