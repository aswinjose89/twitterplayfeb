'use strict';
/*
#title           : routes.js
#description     : This is the main script responsible for talking to different APIs. Also it provides response to teh client based on requests generated.
#author		       : Aswin Jose
#email           : aswin1906@gmail.com
#date            : 20150210
#version         : 1.2
*/

// app/routes.js
//
var sessionstorage = require('sessionstorage');
var allTimeouts = [];
var allServerIntervals = [];
module.exports = function(app, passport, http, appSettings) {
    var fs = require('fs');
    var v8 = require('v8');
    var moment = require('moment');
    var FibonacciHeap = require('fibonacciheap');
    var _ = require('underscore');
    var io = require('socket.io')(http);
    // var bugsnag = require('@bugsnag/js');
    // var bugsnagServer = bugsnag('2111bf766b3662c3a3999fe2b0521c84');
    var humanRedable = require('../thirdparty/filesize.js');
    const sender = require("./tasks/sender");
    var sharedSvc = require('./services/shared_svc.js');
    var DataCollectionHandler = require('./helpers/data_collection_handler');
    try {

        var collectionHandler = new DataCollectionHandler()

        // var default_values_json = JSON.parse(fs.readFileSync('config/default_values_twitterplay.json', 'utf8'));
        var default_values_json = appSettings['default_values_server'];
        const LANGUAGE_LIST_FILE = default_values_json["language_list_file"];
        const NO_OF_RETWEETS_TOBE_DISPLAYED = default_values_json["no_of_retweets_tobe_displayed"];
        const NO_OF_RETWEETS_TOBE_STORED_IN_FILE = default_values_json["no_of_retweets_tobe_stored_in_file"];
        const NO_OF_KEYWORDS_TOBE_STORED_IN_FILE = default_values_json["no_of_keywords_tobe_stored_in_file"];
        const NO_OF_INFLUENTIAL_USERS_TOBE_DISPLAYED = default_values_json["no_of_influential_users_tobe_displayed"];
        const NO_OF_INFLUENTIAL_USERS_TOBE_STORED_IN_FILE = default_values_json["no_of_influential_users_tobe_stored_in_file"];
        const NO_OF_INFLUENTIAL_USERS_TOBE_DISPLAYED_FOR_FOLLOW = default_values_json["no_of_influential_users_tobe_displayed_for_follow"];
        const NO_OF_ACTIVE_USERS_TOBE_DISPLAYED = default_values_json["no_of_active_users_tobe_displayed"];
        const NO_OF_ACTIVE_USERS_TOBE_STORED_IN_FILE = default_values_json["no_of_active_users_tobe_stored_in_file"];
        const NO_OF_ACTIVE_USERS_TOBE_DISPLAYED_FOR_FOLLOW = default_values_json["no_of_active_users_tobe_displayed_for_follow"];
        const NO_OF_MOST_MENTIONED_USERS_TOBE_DISPLAYED = default_values_json["no_of_most_mentioned_users_tobe_displayed"];
        const NO_OF_MOST_MENTIONED_USERS_TOBE_STORED_IN_FILE = default_values_json["no_of_most_mentioned_users_tobe_stored_in_file"];
        const NO_OF_MOST_MENTIONED_USERS_TOBE_DISPLAYED_FOR_FOLLOW = default_values_json["no_of_active_users_tobe_displayed_for_follow"];
        const TWEETS_STORAGE_LIMIT = default_values_json["tweets_storage_limit"];


        var language_list_obj = JSON.parse(fs.readFileSync('config/' + LANGUAGE_LIST_FILE, 'utf8'));

        // var app_config = require('../config/app_config.js');
        var app_config = appSettings['appConfig'];
        var twitterConfig = appSettings['twitterConfig'];
        const TWITTER_CONSUMER_KEY = twitterConfig.twitter_consumer_key;
        const TWITTER_CONSUMER_SECRET = twitterConfig.twitter_consumer_secret;
        // const INSTAGRAM_CLIENT_ID = app_config.instagram_client_id;
        // const INSTAGRAM_CLIENT_SECRETE = app_config.instagram_client_secrete;
        // const INSTAGRAM_ACCESS_TOKEN = app_config.instagram_access_token;

        var LICENSE_TYPE = null;

        function encode_utf8(s) {
            return escape(s);
        }

        function hasLowerCase(str) {
            return str.toUpperCase() != str;
        }

        function hasUpperCase(str) {
            if (str.toLowerCase() != str) {
                return true;
            }
            return false;
        }

        //Function to remove hyperlinks from tweets
        function urlify(text) {
            var urlRegex = /(https?:\/\/[^\s]+)/g;
            return text.replace(urlRegex, function(url) {
                return '';
            })
        }

        //Remove extra whitespaces
        function removeExtraWhiteSpace(text) {
            var urlRegex = /\n|\v|\r|\f/g;
            return text.replace(urlRegex, function(url) {
                return ' ';
            })
        }

        //Remove whitespace between "#" & tag
        function immproveHashTags(text) {
            var regEx = /#\s/g;
            return text.replace(regEx, function(url) {
                return '#';
            })
        };

        //Remove null and other empty values
        function cleanArray(actual) {
            var newArray = new Array();
            for (var i = 0; i < actual.length; i++) {
                if (actual[i]) {
                    newArray.push(actual[i]);
                }
            }
            return newArray;
        }

        function user_info_email_template(email_dict) {
            var user_info_email_template = `
                    <TABLE BORDER="2px solid blue" WIDTH="30%"   CELLPADDING="4" CELLSPACING="0">
                        <TR style="background: #2980b9;font-weight: 900;color: #ffffff;">
                        <TH COLSPAN="2"><BR><H3>User Info</H3>
                        </TH>
                        </TR>
                        <TR ALIGN="CENTER">
                        <TD>Twitter Id</TD>
                        <TD>${email_dict.loggedin_user}</TD>
                        </TR>
                        <TR ALIGN="CENTER">
                        <TD>${email_dict.log_in_out_label}</TD>
                        <TD>${email_dict.log_in_out_time}</TD>
                        </TR>
                        <TR ALIGN="CENTER">
                        <TD>Socket Id</TD>
                        <TD>${email_dict.socket_id}</TD>
                        </TR>
                        ${(email_dict.row_template)?email_dict.row_template:""}
                    </TABLE>
                `
            return user_info_email_template;
        }

        //Variable for multiple connections

        // =====================================
        // HOME PAGE (with login links) ========
        // =====================================
        app.get('/', function(req, res) {
            res.render('index.ejs', {
                appSettings: appSettings
            }); // load the index.ejs file
        });
        var User = require('./models/user');
        var CompanyProfile = require('./models/company_profile');
        var allSocketConnection = []
        app.get('/pricing', isLoggedIn, function(req, res) {
            var loggedin_user = req.user.twitter.username;
            User.findOne({
                'twitter.username': loggedin_user
            }, function(userErr, userData) {
                if (userErr) {
                    logger.log('error', 'User Not Found due to the Exception: %s', userErr, {
                        "fileName": "routes.js",
                        "apiName": "pricing",
                        "mongoModelName": "User"
                    });
                } else {
                    CompanyProfile.findOne({
                        'user': userData._id
                    }, function(userErr, companyProfileData) {
                        if (userErr) {
                            logger.log('error', 'User Not Found due to the Exception: %s', userErr, {
                                "fileName": "routes.js",
                                "apiName": "pricing",
                                "mongoModelName": "CompanyProfile"
                            });
                        } else {
                            if (companyProfileData && companyProfileData.licence_type === 'ENTERPRISE' && companyProfileData.status === 'COMPLETE') {
                                res.redirect('/profile'); // navigate to profile.ejs file
                            } else {
                                res.render('partials/pricing.ejs', {
                                    appSettings: JSON.stringify(appSettings),
                                    amount: (appSettings.payment) ? appSettings.payment.amount.toString().slice(0, -2) : 100
                                }); // render pricing.ejs file
                            }
                        }
                    });
                }
            });
            io.sockets.once("connection", function(socket) {
                allSocketConnection.push(socket);
                socket.on('validateBasicLicense', function(msg) {
                    var loggedin_user = req.user.twitter.username;
                    User.findOne({
                        'twitter.username': loggedin_user
                    }).populate('companyProfile').exec(function(userErr, userData) {
                        if (userErr) {
                            logger.log('error', 'User Not Found due to the Exception: %s', userErr);
                        } else {
                            var companyProfileData = {
                                'user': userData,
                                'licence_type': "BASIC",
                                'status': "DRAFT"
                            };
                            CompanyProfile.findOneAndUpdate({
                                'user': userData._id,
                                'status': "DRAFT"
                            }, companyProfileData, {
                                upsert: true,
                                new: true,
                                setDefaultsOnInsert: true
                            }, function(err, liveTweetsActions) {
                                if (err) {
                                    logger.log('error', 'CompanyProfile Not Found due to the Exception: %s', err);
                                } else {
                                    LICENSE_TYPE = "BASIC"
                                    logger.log('info', 'CompanyProfile created/Updated for the user %s', loggedin_user, {
                                        "fileName": "routes.js",
                                        "mongoModelName": "CompanyProfile",
                                        "socketEventName": "validateBasicLicense"
                                    });
                                    socket.emit('redirectToProfile', "No Data")
                                }
                            });
                        }
                    })
                });
            });
        });

        app.get('/profile_reg', isLoggedIn, function(req, res) {
            res.render('partials/profile_reg_form.ejs'); // load the pricing.ejs file
        });
        app.post('/save-reg-form', isLoggedIn, function(req, res) {
            if (!req.body.company_name) {
                res.redirect('/profile_reg');
            }
            var loggedin_user = req.user.twitter.username;
            User.findOne({
                'twitter.username': loggedin_user
            }).populate('companyProfile').exec(function(userErr, userData) {
                if (userErr) {
                    logger.log('error', 'User Not Found due to the Exception: %s', userErr);
                } else {
                    var companyProfileData = {
                        'user': userData,
                        'licence_type': "ENTERPRISE",
                        'company_name': req.body.company_name,
                        'company_address': req.body.company_address,
                        'company_code': req.body.company_code,
                        'division_code': req.body.division_code,
                        'company_phone_no': req.body.company_phone_no,
                        'email': req.body.email,
                        'status': 'DRAFT'
                    };
                    CompanyProfile.findOneAndUpdate({
                        'user': userData._id
                    }, companyProfileData, {
                        upsert: true,
                        new: true,
                        setDefaultsOnInsert: true
                    }, function(err, liveTweetsActions) {

                        if (err) {
                            logger.log('error', 'CompanyProfile Not Found due to the Exception: %s', err, {
                                "fileName": "routes.js",
                                "mongoModelName": "CompanyProfile",
                                "apiName": "save-reg-form",
                                "reqInput": JSON.stringify(companyProfileData)
                            });
                        } else {
                            LICENSE_TYPE = "BASIC" //It should be Basic untill the payment is completed
                            logger.log('info', 'Saved Company Profile for Enterprise license successfully');
                            res.redirect('/payment');
                        }
                    });
                }
            });
        });
        app.get('/payment', isLoggedIn, function(req, res) {
            res.render('partials/payment.ejs'); // load the payment.ejs file
        });
        app.post('/savePaymentDetails', isLoggedIn, collectionHandler.savePaymentDetails);
        const crypto = require('crypto');
        const squareConnect = require('square-connect');
        const paymentSettings = appSettings.payment;
        const accessToken = paymentSettings.accessToken;
        // Set Square Connect credentials and environment
        const defaultClient = squareConnect.ApiClient.instance;

        // Configure OAuth2 access token for authorization: oauth2
        const oauth2 = defaultClient.authentications['oauth2'];
        oauth2.accessToken = accessToken;


        // Set 'basePath' to switch between sandbox env and production env
        // sandbox: https://connect.squareupsandbox.com
        // production: https://connect.squareup.com
        defaultClient.basePath = paymentSettings.basePath;

        app.post('/process-payment', function(req, res) {
            const request_params = req.body;

            // length of idempotency_key should be less than 45
            const idempotency_key = crypto.randomBytes(22).toString('hex');

            // Charge the customer's card
            const payments_api = new squareConnect.PaymentsApi();
            const request_body = {
                source_id: request_params.nonce,
                amount_money: {
                    amount: paymentSettings.amount, // $1.00 charge, Means it exclude last 2 zeros from the amount
                    currency: paymentSettings.currency
                },
                idempotency_key: idempotency_key
            };

            try {
                const response = payments_api.createPayment(request_body);
                res.status(200).json({
                    'title': 'Payment Successful',
                    'result': response
                });
                LICENSE_TYPE = "ENTERPRISE"
            } catch (error) {
                LICENSE_TYPE = "BASIC"
                res.status(500).json({
                    'title': 'Payment Failure',
                    'result': error.response.text
                });
                bugsnagServer.notify(new Error(error.stack), {
                    severity: 'error'
                });
            }
        });
        app.get('/paymentResult', isLoggedIn, function(req, res) {
            var params = req.query;
            var card_brand = (params.card_brand)?params.card_brand:"Visa",
                card_logo = "/static/img/logo/card/VISA-logo-F3440F512B-seeklogo.com.png",
                card_last_4_digit = params.card_last_4_digit;
            if (card_brand && card_brand === "MASTERCARD") {
                card_brand = "Master";
                card_logo = "/static/img/logo/card/MasterCard-logo-92AB7D0014-seeklogo.com.png";
            } else if (card_brand && card_brand === "AMERICAN_EXPRESS") {
                card_brand = "American Express";
                card_logo = "/static/img/logo/card/american-express-logo-EDF87C04A0-seeklogo.com.png";
            } else if (card_brand && card_brand === "JCB") {
                card_brand = "JCB";
                card_logo = "/static/img/logo/card/jcb-logo-88B016FADF-seeklogo.com.png";
            } else if (card_brand && card_brand === "CHINA_UNIONPAY") {
                card_brand = "China Union Pay";
                card_logo = "/static/img/logo/card/union-pay-logo-9C76FC16AC-seeklogo.com.png";
            } else if (card_brand && card_brand === "DISCOVER") {
                card_brand = "Discover";
                card_logo = "/static/img/logo/card/discover-logo-C2F4F2FB11-seeklogo.com.png";
            }
            res.render('partials/payment_result.ejs', {
                'loginUserDtls': loginUserDtls,
                'paymentAmount': (paymentSettings.amount) ? paymentSettings.amount.toString().slice(0, -2) : paymentSettings.amount,
                'card_brand': card_brand,
                'card_logo': card_logo,
                'card_last_digit': (card_last_4_digit) ? card_last_4_digit.slice(-2) : card_last_4_digit
            }); // load the payment.ejs file
        });



        // =====================================
        // LOGIN ===============================
        // =====================================
        // show the login form
        // app.get('/login', function(req, res) {
        //
        //     // render the page and pass in any flash data if it exists
        //     res.render('login.ejs', { message: req.flash('loginMessage') });
        // });

        // process the login form
        // app.post('/login', do all our passport stuff here);

        // =====================================
        // SIGNUP ==============================
        // =====================================
        // show the signup form
        // app.get('/signup', function(req, res) {
        //
        //     // render the page and pass in any flash data if it exists
        //     res.render('signup.ejs', { message: req.flash('signupMessage') });
        // });



        // process the signup form
        // app.post('/signup', do all our passport stuff here);

        // =====================================
        // PROFILE SECTION =====================
        // =====================================
        // we will want this protected so you have to be logged in to visit
        // we will use route middleware to verify this (the isLoggedIn function)
        //

        var Components = require('./helpers/components');
        var mixinComp = new Components();
        var TweetsHandler = new require('./helpers/tweets_handler');
        var tweets_hdlr = new TweetsHandler();

        var TweetsCloudController = new require('./controllers/tweetsCloudController');
        var tweetsCloudCntr = new TweetsCloudController()
        var adminController = require('./controllers/adminController')
        var adminCntr = new adminController()
        var adminUrls = require('./urls/admin_urls')
        var admin_url = new adminUrls()
        function cpuUsage(){
            const startUsage = process.cpuUsage();
            logger.log('info', 'CPU Usage Details: %s', JSON.stringify(process.cpuUsage(startUsage)));
            logger.log('info', 'Process Memory Details: %s', JSON.stringify(process.memoryUsage()));
            logger.log('info', 'Process Running Time: %s', process.uptime()); //method returns the number of seconds the current Node.js process has been running.
        }
        function node_report(){
            var nodereport = require('node-report');
            nodereport.triggerReport(`../logger/node-report-${new Date().getTime()}.txt`);
        }

        app.get('/profile', isLoggedIn, function(req, res) {
            var appSettingsModel = require('./models/app_settings');
            var pageSettings = require('./models/page_settings');
            var appSettingsConfig = JSON.parse(fs.readFileSync('config/app_settings.json', 'utf8'));
            appSettingsModel.findOneAndUpdate({
                "version": appSettingsConfig['version']
            }, appSettingsConfig, {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            }, function(err, settings) {
                if (err) {
                    logger.log('error', 'app_settings Model API Exception: %s', err);
                } else {
                    pageSettings.findOne({
                        "version": 1
                    }, function(err, page_settings) {
                        if (err) {
                            logger.log('error', 'pageSettings Model API Exception: %s', err);
                        } else {
                            var appSettings = JSON.parse(JSON.stringify(settings));
                            appSettings['page_settings'] = JSON.parse(JSON.stringify(page_settings));
                            require('../environment.js')(appSettings);
                            res.render('profile.ejs', {
                                //res.render('dashboard.ejs', {
                                user: req.user, // get the user out of session and pass to template
                                appSettings: JSON.stringify(appSettings)
                            });
                        }
                    });

                    // Required for showing public files to client. e.g. Images and icons.==========
                    //app.use(express.static(__dirname + '/public'));
                }
            });



            //io.set('transports', ['websocket'], 'upgrade', ['false']);
            var loggedin_user = req.user.twitter.username;
            //Custom code
            var time = new Date();
            var year = time.getFullYear();
            var month = time.getMonth() + 1;
            var date1 = time.getDate();
            var hour = time.getHours();
            var minutes = time.getMinutes();
            var seconds = time.getSeconds();

            var startTime = moment(new Date());
            var startTwtDelay = null; //   If no tweets processed for 5 min for the keywords then show "waiting for the tweets" in snackbar for every 5 minutes...Every five minutes should be calculated of last processed tweets

            var realPath = __dirname;
            realPath = realPath.substring(0, realPath.length - 4);


            var consumerKey = TWITTER_CONSUMER_KEY;
            var consumerSecret = TWITTER_CONSUMER_SECRET;

            //Instagram setup
            // var ig = require('instagram-node').instagram();
            // ig.use({
            //     access_token: INSTAGRAM_ACCESS_TOKEN
            // });
            // ig.use({
            //     client_id: INSTAGRAM_CLIENT_ID,
            //     client_secret: INSTAGRAM_CLIENT_SECRETE
            // });

            var keywordMap = new Object(); //Maintain a list of track keywords.
            var hastagCloud = new Object();
            var keywordCloud = new Object();
            var chartMap = new Object();
            var email_dict = new Object()
            var keywordarray = [];
            var onloadDataCollection;
            var tweetsArray = []; //Stors all the tweets from the begining of the time.
            io.sockets.once("connection", function(socket) {
                allSocketConnection.push(socket)
                process.setMaxListeners(0); //Its indicates unlimited listeners..Default is 10 listeners approximately.
                var msg = "SocketID: " + socket.id + "      Connection established for the user: " + loggedin_user + " @" + year + "-" + month + "-" + date1 + " " + hour + ":" + minutes + ":" + seconds + "\n";
                // fs.appendFile(realPath + '/logger/ApplicationAccess.log', msg, function(err) {});
                // console.log(msg);
                logger.log('info', msg);
                logger.log('info', 'Process Details: %s', JSON.stringify(process.env));
                //var socketIDForUniqueName = socket.id.replace(/\\/g, '').replace(/\//g, '');
                var User_information = "";
                var log_in_out = "Log-In @ ";
                User_information += "User Twitter Id: @" + loggedin_user + "\n" + log_in_out + " " + year + "-" + month + "-" + date1 + " " + hour + ":" + minutes + ":" + seconds + "\n" + "socket id : " + socket.id + "\n";

                email_dict.socket_id = socket.id;
                email_dict.loggedin_user = loggedin_user;
                email_dict.log_in_out_label = "Log-In @ ";
                email_dict.log_in_out_time = moment().subtract(1, 'year').format("YYYY-MM-DD hh:mm:ss");

                var timestampForUniqueName = year + month + date1 + "-" + hour + minutes + seconds;

                var sentiFileCount = 1;
                var sentSentiCounter = 1;
                var counterTweets = 0;
                var tweetsQueue = [];
                var tweetsChunkForSenti = [];

                var Twitter = require('node-tweet-stream');
                var client = new Twitter({
                    consumer_key: consumerKey,
                    consumer_secret: consumerSecret,
                    token: req.user.twitter.token,
                    token_secret: req.user.twitter.tokenSecret,
                }, {
                    tweet_mode: "extended"
                });

                var TwitterREST = require('twitter');
                global.clientREST = new TwitterREST({
                    consumer_key: consumerKey,
                    consumer_secret: consumerSecret,
                    access_token_key: req.user.twitter.token,
                    access_token_secret: req.user.twitter.tokenSecret,
                });

                var bugsnag = require("bugsnag");
                bugsnag.register("32f2c7c0cac778c36aa4ffca5556a5a4", {
                    onUncaughtError: function(err) {
                        console.error(err.stack || err);
                    }
                });


                var loggedin_user_screen_name = req.user.twitter.username;
                var totalRetweetCount = 0;
                var totalRetweetMatches = 0;
                var totalTweetCount = 0;
                var keywordstring = "";
                var hashtagTweets = 0;
                var usermentionTweets = 0;

                var tweetsCountPerLangMap = new Object();
                for (var language_id in language_list_obj) {
                    tweetsCountPerLangMap[language_id] = 0;
                }

                //map[key] = [Frequency, last accessed date&time, Item Id, Original item]
                //Item id: 1- HashTag, 2-User mention, 3-Keyword
                var map = new Object(); //Global MAP for all the upcoming tweets.


                var keywordMapSize = 0;
                var emailTriggerFirstTimeKeyEnter = 0;
                // var MAX_INT = Number.MAX_SAFE_INTEGER;
                var MAX_INT = 9999999999;
                var influentialUsersAvailibilityRecord = new Object();
                var influentialUsersFBHeap = new FibonacciHeap(); //Maintain top K most influential users (with maximum followers).

                var activeUsersAvailibilityRecord = new Object();
                var activeUsersFBHeap = new FibonacciHeap(); //Maintain top K most active users (with maximum tweets).

                var topRetweetsAvailibilityRecord = new Object();
                var topRetweetsFBHeap = new FibonacciHeap(); //Maintain top K most retweeted tweets.
                var topRetweetIdmaster = [];

                var mentionedUsers = [];
                var prev_twt_id_str = " ";
                var highestCount = 0;
                var highestCountForTweetsActiveUser = 0;
                var highestCountForTopReTweetsActiveUser = 0;
                var minFollowersCountInHeap = MAX_INT;
                var minTweetsCountInHeap = MAX_INT;
                var minReTweetsCountInHeap = MAX_INT;
                var longlatarray = []; // stores all longitude/ lattitude data for tweets
                var tweetTlChartDataset = [];
                var tempTweetsStoreArr = [];
                var retweetsArray = []; // stores all unique retweets from the beginning
                var negTweetsArray = [];
                var posTweetsArray = [];
                var neutralTweetsArray = [];
                var English_tweet = 0;
                var coordcount = 0; // stores total count of tweets which have GPS coordinates.
                var RTcoordcount = 0; // stores total count of Retweets which have GPS coordinates
                var tweetUndelivered = " "; // no of tweets undelivered due to twitter limits.unImp

                var negTweetsArrayAll = [];
                //var dangercheck = 0;   // difference between total received and total processed. ie buffer.
                //var dangerlevel  = 60; // cut off buffer limit to force auto saving and quit.
                //var traffic_hit = "N";  // variable used to check whether traffic limit is hit first time.
                var posTweetsArrayAll = [];
                var neutralTweetsArrayAll = [];
                var sessioncounter = 1; // used for storing multiple sessions identification for writing every X number of tweets
                var unImp; //Ignore word list.
                var downloadFileName = "";
                var list = require('./models/list'); //Load model for ignore word list.
                var dynamic_fields = require('./models/dynamic_field_options');

                var trackFlag = 0; //1 for all hashtahs, 2 for all keywords, 3 for custom keywords

                var top10HashTagsForInsta = [];

                var Sentiments = require('./Sentiment140.js');
                var sentimentClassificationFunction = 0;

                //var noOfAllTweetsFileSrNo = 1;
                //var fileNameAllTweets = fileNameCommonPrefix+'_tweetlist.xls';
                //var allTweetsHeader = "Tweet ID"+"\t"+"Name"+"\t"+"Display Name"+"\t"+"Location"+"\t"+"Text"+"\t"+"Language"+"\t"+"User Description"+"\n";
                //var path = __dirname;
                //path = path.substring(0, path.length-4);
                //fs.appendFile(path+'/public/'+fileNameAllTweets, allTweetsHeader, function (err) {});
                var unImpLength = 0;
                list.findOne(function(err, list) {
                    if (err) return console.error(err);
                    unImp = list.words;
                    //Calculate length of unImp
                    for (let p in unImp) {
                        unImpLength++;
                    }
                });

                dynamic_fields.findOne(function(err, data) {
                    if (err) return console.error(err);
                    onloadDataCollection = data;
                    socket.emit("dynamic_field_data_loader", onloadDataCollection);
                });
                if (LICENSE_TYPE === 'BASIC') {
                    socket.emit("basic_license_tweet_limit", default_values_json["basic_license_type_tweet_limit"]);
                }

                console.log("unImpLength1: " + unImpLength);

                var nodemailer = require('nodemailer');
                var xoauth2 = require('xoauth2');

                // listen for token updates (if refreshToken is set)
                // you probably want to store these to a db
                socket.on('token', function(token) {
                    console.log('New token for %s: %s', token.user, token.accessToken);
                });
                var nodemailerConfig = appSettings['nodemailer'];
                global.transporter = nodemailer.createTransport({
                    service: nodemailerConfig['service'],
                    auth: {
                        xoauth2: xoauth2.createXOAuth2Generator({
                            user: nodemailerConfig['auth']['user'],
                            clientId: nodemailerConfig['auth']['clientId'],
                            clientSecret: nodemailerConfig['auth']['clientSecret'],
                            refreshToken: nodemailerConfig['auth']['refreshToken'],
                            accessToken: nodemailerConfig['auth']['accessToken']
                        })
                    }
                });
                socket.on('memoryUsageRequest',function(){
                    const memoryUsage = v8.getHeapStatistics();
                    let memoryObj={},
                    heapTotal= (memoryUsage.total_available_size/1024/1024).toFixed(2),
                    heapUsed= (memoryUsage.used_heap_size/1024/1024).toFixed(2);
                    memoryObj.heapTotal = heapTotal;
                    memoryObj.heapUsed = heapUsed;
                    memoryObj.heapUsedPercent = Math.round((heapUsed/heapTotal)*100);
                    socket.emit('memoryUsageResponse', memoryObj);
                });
                process
                    .on('unhandledRejection', function(err) {
                        bugsnagServer.notify(new Error(err.stack), {
                            severity: 'error'
                        });
                        var random_id = Math.trunc(Math.random() + new Date().getTime());
                        var login_user_name = (loggedin_user_screen_name) ? loggedin_user_screen_name : (loginUserDtls && loginUserDtls.username) ? loginUserDtls.username : "User Undefined";
                        logger.log("error", 'FileName:routes.js, Error Id: %s ,Unhandled Rejection at Promise for user:%s', random_id, login_user_name, {
                            Exception: err
                        });
                        mixinComp.exceptionEmail(transporter, logger, `TwitterPlay(${loggedin_user_screen_name}): Unhandled Rejection at Promise`, err.stack, loggedin_user_screen_name, random_id);
                        socket.emit("exception");
                        node_report();
                    })
                    .on('uncaughtException', function(err) {
                        bugsnagServer.notify(new Error(err.stack), {
                            severity: 'error'
                        });
                        var random_id = Math.trunc(Math.random() + new Date().getTime());
                        var login_user_name = (loggedin_user_screen_name) ? loggedin_user_screen_name : (loginUserDtls && loginUserDtls.username) ? loginUserDtls.username : "User Undefined";
                        logger.log("error", 'FileName:routes.js, Error Id: %s , Uncaught Exception thrown for user:%s', random_id, login_user_name, {
                            Exception: err
                        });
                        mixinComp.exceptionEmail(transporter, logger, `TwitterPlay(${login_user_name}): Uncaught Exception`, err.stack, login_user_name, random_id);
                        socket.emit("exception");
                        node_report();
                    })
                    .on('warning', (warning) => {
                        logger.log('info', `Node Process Warning Name: ${warning.name}, message: ${warning.message}, stackTrace: ${warning.stack}`);
                      });
                socket.on("uiException", function(err) {
                    bugsnagServer.notify(new Error(err.stack), {
                        severity: 'error'
                    });
                    var random_id = Math.trunc(Math.random() + new Date().getTime());
                    var login_user_name = (loggedin_user_screen_name) ? loggedin_user_screen_name : (loginUserDtls && loginUserDtls.username) ? loginUserDtls.username : "User Undefined";
                    logger.log("error", 'FileName:routes.js, Error Id: %s , Uncaught GUI Exception thrown for user:%s', random_id, login_user_name, {
                        Exception: err
                    });
                    mixinComp.exceptionEmail(transporter, logger, `TwitterPlay(${login_user_name}): Uncaught Exception`, err, login_user_name, random_id);
                    socket.emit("exception");
                });

                client.on('reconnect', function(reconnect) {
                    bugsnagServer.notify(new Error(reconnect), {
                        severity: 'error'
                    });
                    logger.log("error", "Twitter error...reconnecting: %s", JSON.stringify(reconnect), {
                        "FileName": "routes.js",
                        "clientEvent": "reconnect"
                    })
                    socket.emit("twitter_error", reconnect.type);
                });



                var prev_tweet_id = 0;

                var posSentCount = 0;
                var negSentCount = 0;
                var neutralSentCount = 0;

                // function updateSentiFileCounter(){
                //   var fileName = realPath+'/public/tweet_files/'+fileNameCommonPrefix+'_'+sentiFileCount;
                //   if(fs.existsSync(fileName)){
                //     sentiFileCount++;
                //     var contents = fs.readFileSync(fileName).toString().split('\r\n');
                //
                //     request({url: 'http://tpsentiment.cloudapp.net:9090',
                //              qs: {},
                //              method: 'POST',
                //              json: contents
                //             }, function(error, response, body){
                //             if(error) {
                //                  console.log("Sentiment module error: "+error);
                //             } else {
                //                  var jsonArray = JSON.parse(body.split('\r\n\r\n')[1]);
                //                  for(var i=0; i<jsonArray.length; i++){
                //                     if(jsonArray[i].sentiment === 'pos'){
                //                       //fs.appendFile(path+'/public/'+posSentiTweetsFileName, jsonArray[i].tweet+"\n", function (err) {});
                //                       posTweetsArray.push(jsonArray[i].tweet);
                //                       posSentCount++;
                //                     }
                //                     else if(jsonArray[i].sentiment === 'neg'){
                //                       //fs.appendFile(realPath+'/public/'+negSentiTweetsFileName, jsonArray[i].tweet+"\n", function (err) {});
                //                       negTweetsArray.push(jsonArray[i].tweet);
                //                       negSentCount++;
                //                     }
                //                  }
                //                  console.log("someting happned! Tell the issue!");
                //             }
                //     });
                //
                //   }
                //   setTimeout(updateSentiFileCounter, 10000);
                // }
                //
                //


                //Considering sentiments using NLTK
                // function updateSentiFileCounter(){
                //   //var fileName = realPath+'/public/tweet_files/'+fileNameCommonPrefix+'_'+sentiFileCount;
                //   if(tweetsChunkForSenti.length != 0){
                //     //sentiFileCount++;
                //     //var contents = fs.readFileSync(fileName).toString().split('\r\n');
                //     var contents = [].concat(tweetsChunkForSenti);
                //     tweetsChunkForSenti = [];
                //     Sentiments.getSentiments(contents, function(posTweetsArrayArg, negTweetsArrayArg, posSentCountArg, negSentCountArg){
                //         //console.log(posTweetsArrayArg, negTweetsArrayArg, posSentCountArg, negSentCountArg);
                //         //posTweetsArray = posTweetsArray.concat(posTweetsArrayArg);
                //         //negTweetsArray = negTweetsArray.concat(negTweetsArrayArg);
                //         //neutralTweetsArray = neutralTweetsArray.concat(neutralTweetsArrayArg)
                //         posSentCount+=posSentCountArg;
                //         negSentCount+=negSentCountArg;
                //     })
                //   }
                //   setTimeout(updateSentiFileCounter, 10000);
                // }

                //Considering sentiment140
                function updateSentiFileCounter() {
                    //console.log("processing positive sentiment count " +  posSentCount);
                    //var fileName = realPath+'/public/tweet_files/'+fileNameCommonPrefix+'_'+sentiFileCount;
                    if (tweetsChunkForSenti.length != 0) {
                        //sentiFileCount++;
                        //var contents = fs.readFileSync(fileName).toString().split('\r\n');
                        var contents = [].concat(tweetsChunkForSenti);
                        tweetsChunkForSenti = [];
                        Sentiments.getSentiments(contents, function(posTweetsArrayArg, negTweetsArrayArg, neutralTweetsArrayArg, posSentCountArg, negSentCountArg, neutralSentCountArg) {
                            // console.log(posTweetsArrayArg, negTweetsArrayArg, posSentCountArg, negSentCountArg);
                            posTweetsArray = posTweetsArray.concat(posTweetsArrayArg);
                            negTweetsArray = negTweetsArray.concat(negTweetsArrayArg);
                            neutralTweetsArray = neutralTweetsArray.concat(neutralTweetsArrayArg)

                            posTweetsArrayAll = posTweetsArrayAll.concat(posTweetsArrayArg);
                            negTweetsArrayAll = negTweetsArrayAll.concat(negTweetsArrayArg);
                            neutralTweetsArrayAll = neutralTweetsArrayAll.concat(neutralTweetsArrayArg)

                            posSentCount += posSentCountArg;
                            negSentCount += negSentCountArg;
                            neutralSentCount += neutralSentCountArg;
                        })
                    }
                    //   allTimeouts.push(setTimeout(updateSentiFileCounter, 10000));
                }

                //   updateSentiFileCounter();
                allServerIntervals.push(setInterval(updateSentiFileCounter, 10000)) //Commented_senti

                client.on("tweet", function(tweet) {
                    if (trackFlag == 1) {
                        if (tweet.entities.hashtags.length > 0) {
                            tweetsQueue.push(tweet);
                            counterTweets++;
                        }
                    } else {
                        tweetsQueue.push(tweet);
                        counterTweets++;
                    }
                    socket.emit("total_tweets_at_server", tweetsQueue.length);
                });


                socket.on("maxlimitreached", function(msg) {
                    logger.log('error', 'Tweets exceeded maximum limit... auto saving & exiting.. : %s', msg);
                });

                socket.on("servertraffic", function(msg) {
                    logger.log('error', 'Buffer tweets exceeded limit... auto saving & exiting.. : %s', msg);
                });

                socket.on('connect_failed', function() {
                    logger.log('error', 'Sorry, there seems to be an issue with the connection!');
                });
                socket.on('error', function(err) {
                    bugsnagServer.notify(new Error(err.stack), {
                        severity: 'error'
                    });
                    var random_id = Math.trunc(Math.random() + new Date().getTime());
                    var login_user_name = (loggedin_user_screen_name) ? loggedin_user_screen_name : (loginUserDtls && loginUserDtls.username) ? loginUserDtls.username : "User Undefined";
                    logger.log("error", 'FileName:routes.js, Error Id: %s, Socket Error Exception::%s', random_id, login_user_name, {
                        Exception: err
                    });
                    mixinComp.exceptionEmail(transporter, logger, `TwitterPlay(${login_user_name}): Socket Error Exception`, err.stack, login_user_name, random_id);
                    socket.emit("exception");
                });

                client.on("warning", function(msg) {
                    logger.log('error', "Twitter buffer full warning " + msg.code + "  " + msg.percent_full);
                    socket.emit("apiwarning", msg);
                });

                client.on("limit", function(msg) {
                    tweetUndelivered = msg.track;
                    //  console.log("No.of undelivered tweets : " + msg.track);
                    //socket.emit ("limitwarning", msg);
                });

                client.on("disconnect", function(msg) {
                    console.log("Twitter API disconnected " + msg.code);
                    logger.log('error', 'Twitter API disconnected: %s', msg.code);
                    socket.emit("apidisconnect", msg);
                });
                const debounce = (time) => {
                    let timeout;
                    return function() {
                        clearTimeout(timeout);
                        timeout = setTimeout(functionCall, time);
                    }
                }

                function processTweetsQueue() {
                    if (tweetsQueue.length > 0) {
                        var tweet = tweetsQueue.shift();
                        processTweet(tweet);
                        // startTwtDelay = new Date()
                        //   allTimeouts.push(setTimeout(processTweetsQueue, 0));
                    }
                    // else {
                    //     debounce(500);
                    //     //   allTimeouts.push(setTimeout(processTweetsQueue, 500));
                    // }
                }
                //   processTweetsQueue();
                allServerIntervals.push(setInterval(processTweetsQueue, 0));
                allServerIntervals.push(setInterval(cpuUsage, 5000));

                // function vaidateTwtsDelay() {
                //     if (startTwtDelay) {
                //         let endTwtDelay = new Date();
                //         var twtsDelayInMnts = (parseInt(endTwtDelay.getMinutes()) - parseInt(startTwtDelay.getMinutes()));
                //         if (twtsDelayInMnts >= 6) {
                //             socket.emit('twts_time_delay_msg');
                //         }
                //     }
                //     // allTimeouts.push(setTimeout(vaidateTwtsDelay, 0));
                // }
                // allServerIntervals.push(setInterval(vaidateTwtsDelay, 0)); //If no tweets processed for 5 min for the keywords then show "waiting for the tweets" in snackbar for every 5 minutes...Every five minutes should be calculated of last processed tweets
                //   vaidateTwtsDelay();   //If no tweets processed for 5 min for the keywords then show "waiting for the tweets" in snackbar for every 5 minutes...Every five minutes should be calculated of last processed tweets
                function dynamicTweetTimelineChart() {
                    if (Object.keys(chartMap).length > 0) {
                        var currentTime = moment(new Date());
                        socket.emit('drawTweetsTimelineChart', chartMap, currentTime.diff(startTime, 'minutes'));
                        //   allTimeouts.push(setTimeout(dynamicTweetTimelineChart, 10000));
                    }
                    //   else {
                    //       allTimeouts.push(setTimeout(dynamicTweetTimelineChart, 10000));
                    //   }
                }
                //   dynamicTweetTimelineChart();
                allServerIntervals.push(setInterval(dynamicTweetTimelineChart, 10000));

                //Tweets sentiment classification starts
                function updateNegDisplay() {
                    if (negTweetsArray.length > 0) {
                        socket.emit('takeNegTweet', negTweetsArray.pop());
                        //   allTimeouts.push(setTimeout(updateNegDisplay, 1000));
                    }
                    //   else {
                    //       allTimeouts.push(setTimeout(updateNegDisplay, 1000));
                    //   }
                }
                //   updateNegDisplay();
                allServerIntervals.push(setInterval(updateNegDisplay, 1000));

                function updatePosDisplay() {
                    if (posTweetsArray.length > 0) {
                        socket.emit('takePosTweet', posTweetsArray.pop());
                        //   allTimeouts.push(setTimeout(updatePosDisplay, 1000));
                    }
                    //   else {
                    //       allTimeouts.push(setTimeout(updatePosDisplay, 1000));
                    //   }
                }
                //   updatePosDisplay();

                allServerIntervals.push(setInterval(updatePosDisplay, 1000));

                function updateNeutralDisplay() {
                    //console.log("No.of entries in neutral array  : " + msg.track);
                    if (neutralTweetsArray.length > 0) {
                        socket.emit('takeNeutralTweet', neutralTweetsArray.pop());
                        //   allTimeouts.push(setTimeout(updateNeutralDisplay, 1000));
                    }
                    //   else {
                    //       allTimeouts.push(setTimeout(updateNeutralDisplay, 1000));
                    //   }
                }
                //   updateNeutralDisplay();
                allServerIntervals.push(setInterval(updateNeutralDisplay, 1000));
                //Tweets sentiment classification ends

                socket.on("turnOffSentiClass", function(data) {
                    setTimeout(updateNegDisplay, MAX_INT);
                    setTimeout(updatePosDisplay, MAX_INT);
                    setTimeout(updateNeutralDisplay, MAX_INT);
                });

                socket.on("turnOnSentiClass", function(data) {
                    if (sentimentClassificationFunction === 0) {
                        sentimentClassificationFunction = 1;
                        updateNegDisplay();
                        updatePosDisplay();
                        updateNeutralDisplay();
                    } else {
                        negTweetsArray = [];
                        posTweetsArray = [];
                        neutralTweetsArray = [];
                        setTimeout(updateNegDisplay, 1000);
                        setTimeout(updatePosDisplay, 1000);
                        setTimeout(updateNeutralDisplay, 1000);
                    }

                });

                function processTweet(tweet) {
                    var tweetSenti = mixinComp.get_tweet_text(tweet);

                    tweetSenti = tweetSenti.trim().replace(/[\t\r\n]+/g, ' ') + '\r\n';
                    var tweetObjMin = {
                        text: tweetSenti,
                        profile_image_url_https: tweet.user.profile_image_url_https,
                        name: tweet.user.name,
                        screen_name: tweet.user.screen_name,
                        location: tweet.user.location,
                        retweeted_status: tweet.retweeted_status
                    };
                    //fs.appendFile(realPath+'/public/tweet_files/'+fileNameSenti, tweetSenti, function (err) {});
                    if (tweet.lang == 'en') {
                        tweetsChunkForSenti.push(tweetObjMin);
                    }
                    var curr_twt_id_str = tweet.id_str;
                    if (prev_twt_id_str != curr_twt_id_str) {
                        prev_twt_id_str = curr_twt_id_str;
                        socket.emit('takeTweet', tweet, keywordMap, totalTweetCount); //Send tweet to client.
                        totalTweetCount++;
                        //console.log("-----------------XXXXXXXXXXXXXXXXX--START--XXXXXXXXXXXXXXXXXXXXXXx--------------------------------------");
                        //console.log(tweet);
                        //console.log(tweet.id);
                        //console.log("-----------------XXXXXXXXXXXXXXXXX--END--XXXXXXXXXXXXXXXXXXXXXXXXx--------------------------------------");
                        var tweet_text = mixinComp.get_tweet_text(tweet);
                        // var hindi = "गिरफ्तार तस्कर ने जब इस बात का खुलासा किया तो अधिकारी हैरान रह गए. https://t.co/QGID2AE6zS"
                        // var tweet_text=utf8.encode(hindi)
                        var name = tweet.user.name;
                        var user_id = tweet.user.id;
                        var screen_name = tweet.user.screen_name;
                        var location = tweet.user.location;
                        var followers_count = tweet.user.followers_count;
                        var friends_count = tweet.user.friends_count;
                        var profile_banner_url = tweet.user.profile_banner_url;
                        var statuses_count = tweet.user.statuses_count;
                        var profile_image_url_https = tweet.user.profile_image_url_https;
                        var tweet_id = "TID: " + tweet.id;
                        var tweet_id_str = "TID Str:" + tweet.id_str;
                        var id_str = tweet.id_str;
                        var language = tweet.lang;
                        var user_description = tweet.user.description;
                        var retweeted_status = tweet.retweeted_status;
                        var favorites_count = tweet.user.favourites_count;
                        var created_at_time = tweet.user.created_at;
                        var utc_offset = tweet.user.utc_offset;
                        var time_zone = tweet.user.time_zone;
                        var geo_enabled = tweet.user.geo_enabled;
                        var geo = tweet.geo;
                        var coordinates = tweet.coordinates;
                        var source = tweet.source;
                        if (tweet.coordinates && tweet.coordinates !== "null" && tweet.coordinates !== "undefined") {
                            //console.log ("tweet coordinate & type for tweet id = "+ tweet_id_str + "  " + tweet.coordinates.coordinates[0] + "   "+ tweet.coordinates.coordinates[1]+ "  "+ tweet.coordinates.type);
                            coordcount++;
                        }


                        var place = tweet.place;
                        var possibly_sensitive = tweet.possibly_sensitive;
                        var filter_level = tweet.filter_level;
                        var created_at = tweet.created_at;
                        var verified = tweet.user.verified;
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




                        tweetsCountPerLangMap[language]++;
                        if (language == 'en') {
                            English_tweet++;
                        }
                        if (location && location !== "null" && location !== "undefined") {
                            location = location.replace(/ +(?= )/g, '');
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
                            id_str: id_str,
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
                            source: source,
                            session_id: sessionstorage.getItem('login_session_id')
                        }
                        // tweetsArray.push(tweetObj); //Debug comment
                        let liveTweetsStreamObj = tweetObj;

                         //----------------------------------NewCode Top retweets
                    if (retweeted_status && retweeted_status !== "null" && retweeted_status !== "undefined") {
                        totalRetweetCount++;
                        var retweet_id = "TID: " + retweeted_status.id;
                        var retweet_id_str = "TID Str: " + retweeted_status.id_str;
                        var retweet_text = (retweeted_status.extended_tweet && retweeted_status.extended_tweet.full_text) ? retweeted_status.extended_tweet.full_text : retweeted_status.text;
                        var retweet_user_name = retweeted_status.user.name;
                        var retweet_user_screen_name = retweeted_status.user.screen_name;
                        var retweet_user_profile_image_url_https = retweeted_status.user.profile_image_url_https;
                        var profile_banner_url = retweeted_status.user.profile_banner_url;
                        var retweet_count = retweeted_status.retweet_count;
                        var retweet_user_location = retweeted_status.user.location;
                        var retweet_created_at = retweeted_status.created_at;
                        var retweet_source = retweeted_status.source;
                        var retweet_user_url = retweeted_status.user.url;


                        var retweet_user_description = retweeted_status.user.description;
                        var retweet_user_followers_count = retweeted_status.user.followers_count;
                        var retweet_user_friends_count = retweeted_status.user.friends_count;
                        var retweet_user_listed_count = retweeted_status.user.listed_count;
                        var retweet_user_favourites_count = retweeted_status.user.favourites_count;
                        var retweet_user_statuses_count = retweeted_status.user.statuses_count;
                        var retweet_user_created_at = retweeted_status.user.created_at;
                        var retweet_user_utc_offset = retweeted_status.user.utc_offset;
                        var retweet_user_time_zone = retweeted_status.user.time_zone;
                        var retweet_user_geo_enabled = retweeted_status.user.geo_enabled;
                        var retweet_user_lang = retweeted_status.user.lang;

                        var retweet_tweet_coordinates = retweeted_status.coordinates;
                        var retweet_tweet_place = retweeted_status.place;
                        var retweet_tweet_favorite_count = retweeted_status.favorite_count;
                        var retweet_tweet_filter_level = retweeted_status.filter_level;
                        var retweet_tweet_lang = retweeted_status.lang;

                        if (retweeted_status.coordinates && retweeted_status.coordinates !== "null" && retweeted_status.coordinates !== "undefined") {
                            //console.log ("tweet coordinate & type for tweet id = "+ tweet_id_str + "  " + tweet.coordinates.coordinates[0] + "   "+ tweet.coordinates.coordinates[1]+ "  "+ tweet.coordinates.type);
                            RTcoordcount++;
                        }


                        // added 14 fields to retweet xls stream file. retweet_created_at:retweeted_status.created_at, retweet_source : retweeted_status.source,retweet_user_url:retweeted_status.user.url,
                        //retweet_user_description: retweeted_status.user.description,retweet_user_followers_count:retweeted_status.user.followers_count, retweet_user_friends_count: retweeted_status.user.friends_count, retweet_user_listed_count:retweeted_status.user.listed_count, retweet_user_favourites_count:retweeted_status.user.favourites_count, retweet_user_statuses_count:retweeted_status.user.statuses_count, retweet_user_created_at : retweeted_status.user.created_at, retweet_user_utc_offset:retweeted_status.user.utc_offset, retweet_user_time_zone: retweeted_status.user.time_zone,

                        //retweet_user_geo_enabled: retweeted_status.user.geo_enabled, retweet_user_lang:retweeted_status.user.lang,retweet_tweet_coordinates = retweeted_status.coordinates, retweet_tweet_place:retweeted_status.place, retweet_tweet_favorite_count: retweeted_status.favorite_count, retweet_tweet_filter_level:retweeted_status.filter_level, retweet_tweet_lang: retweeted_status.lang,

                        //"RT created_at"+"\t"+"RT_source"+"\t"+ "RT user_url"+"\t"+ "RT user_description"+"\t"+"RT user_followers_count"+"\t"+ "RT user_friends_count"+"\t"+ "RT user_listed_count"+"\t"+ "RT user_favourites_count"+"\t"+ "RT user_statuses_count"+"\t"+ "RT user_created_at"+"\t"+ "RT user_utc_offset"+"\t"+ "RT user_time_zone"+"\t"+ "RT user_geo_enabled"+"\t"+ "RT user_lang"+"\t"+ "RT tweet_coordinates"+"\t"+ "RT tweet_place"+"\t"+ "RT tweet_favorite_count"+"\t"+ "RT tweet_filter_level"+"\t"+ "RT tweet_lang+"\t"+"

                        //TopKMaxReTweets[i-2].retweet_created_at +"\t"+TopKMaxReTweets[i-2].retweet_source+"\t"+TopKMaxReTweets[i-2].retweet_user_url+"\t"+TopKMaxReTweets[i-2].retweet_user_description+"\t"+TopKMaxReTweets[i-2].retweet_user_followers_count+"\t"+TopKMaxReTweets[i-2].retweet_user_friends_count+"\t"+TopKMaxReTweets[i-2].retweet_user_listed_count+"\t"+TopKMaxReTweets[i-2].retweet_user_favourites_count+"\t"+TopKMaxReTweets[i-2].retweet_user_statuses_count+"\t"+TopKMaxReTweets[i-2].retweet_user_created_at+"\t"+TopKMaxReTweets[i-2].retweet_user_utc_offset+"\t"+ TopKMaxReTweets[i-2].retweet_user_time_zone+ "\t"+TopKMaxReTweets[i-2].retweet_user_geo_enabled+ "\t"+TopKMaxReTweets[i-2].retweet_user_lang+"\t"+TopKMaxReTweets[i-2].retweet_tweet_coordinates+"\t"+TopKMaxReTweets[i-2].retweet_tweet_place+"\t"+TopKMaxReTweets[i-2].retweet_tweet_favorite_count+"\t"+TopKMaxReTweets[i-2].retweet_tweet_filter_level+"\t"+TopKMaxReTweets[i-2].retweet_tweet_lang
                        // this logic is to check whether the Retweet Id already exists in topRetweetIdmaster index.
                        //only if it doesnt exist , then only Retweet added to the RT array.



                        // remove all white spaces in RT user location, RT user description, RT text
                        if (retweet_user_location && retweet_user_location !== "null" && retweet_user_location !== "undefined") {
                            retweet_user_location = retweet_user_location.replace(/ +(?= )/g, '');
                        }

                        if (retweet_text && retweet_text !== "null" && retweet_text !== "undefined") {
                            retweet_text = removeExtraWhiteSpace(retweet_text);
                            retweet_text = retweet_text.replace(/ +(?= )/g, '');
                        }

                        if (retweet_user_description && retweet_user_description !== "null" && retweet_user_description !== "undefined") {
                            retweet_user_description = removeExtraWhiteSpace(retweet_user_description);
                        }
                        var matchexist = "N";
                        if (topRetweetIdmaster.indexOf(retweet_id_str) > -1) {
                            //if (retweet_id_str in topRetweetIdmaster ){
                            totalRetweetMatches++;
                            matchexist = "Y";
                        } else {
                            topRetweetIdmaster.push(retweet_id_str);
                            // retweetsArray.push({
                            //     retweet_id: retweet_id,
                            //     retweet_id_str: retweet_id_str,
                            //     retweet_user_name: retweet_user_name,
                            //     retweet_user_screen_name: retweet_user_screen_name,
                            //     retweet_text: retweet_text,
                            //     retweet_user_profile_image_url_https: retweet_user_profile_image_url_https,
                            //     retweet_count: retweet_count,
                            //     retweet_user_location: retweet_user_location,
                            //     retweet_created_at: retweeted_status.created_at,
                            //     retweet_source: retweeted_status.source,
                            //     retweet_user_url: retweeted_status.user.url,
                            //     retweet_user_description: retweet_user_description,
                            //     retweet_user_followers_count: retweeted_status.user.followers_count,
                            //     retweet_user_friends_count: retweeted_status.user.friends_count,
                            //     retweet_user_listed_count: retweeted_status.user.listed_count,
                            //     retweet_user_favourites_count: retweeted_status.user.favourites_count,
                            //     retweet_user_statuses_count: retweeted_status.user.statuses_count,
                            //     retweet_user_created_at: retweeted_status.user.created_at,
                            //     retweet_user_utc_offset: retweeted_status.user.utc_offset,
                            //     retweet_user_time_zone: retweeted_status.user.time_zone,
                            //     retweet_user_geo_enabled: retweeted_status.user.geo_enabled,
                            //     retweet_user_lang: retweeted_status.user.lang,
                            //     retweet_tweet_coordinates: retweeted_status.coordinates,
                            //     retweet_tweet_place: retweeted_status.place,
                            //     retweet_tweet_favorite_count: retweeted_status.favorite_count,
                            //     retweet_tweet_filter_level: retweeted_status.filter_level,
                            //     retweet_tweet_lang: retweeted_status.lang,
                            //     profile_banner_url: profile_banner_url
                            // });
                        }


                        //var topReTweetRecord = {tweet_id:tweet_id, retweet_id:retweet_id, retweet_user_name:retweet_user_name, retweet_user_screen_name:retweet_user_screen_name, retweet_text:retweet_text, retweet_user_profile_image_url_https:retweet_user_profile_image_url_https, retweet_count:retweet_count, retweet_user_location:retweet_user_location};
                        //var topReTweetRecord = {tweet_id:tweet_id,retweet_id:retweet_id, retweet_id_str: retweet_id_str, retweet_user_name:retweet_user_name, retweet_user_screen_name:retweet_user_screen_name, retweet_text:retweet_text, retweet_user_profile_image_url_https:retweet_user_profile_image_url_https, retweet_count:retweet_count, retweet_user_location:retweet_user_location,retweet_created_at:retweeted_status.created_at, retweet_source : retweeted_status.source,retweet_user_url:retweeted_status.user.url,retweet_user_description: retweet_user_description,retweet_user_followers_count:retweeted_status.user.followers_count, retweet_user_friends_count: retweeted_status.user.friends_count, retweet_user_listed_count:retweeted_status.user.listed_count, retweet_user_favourites_count:retweeted_status.user.favourites_count, retweet_user_statuses_count:retweeted_status.user.statuses_count, retweet_user_created_at : retweeted_status.user.created_at, retweet_user_utc_offset:retweeted_status.user.utc_offset, retweet_user_time_zone: retweeted_status.user.time_zone,retweet_user_geo_enabled: retweeted_status.user.geo_enabled, retweet_user_lang:retweeted_status.user.lang,retweet_tweet_coordinates:retweeted_status.coordinates, retweet_tweet_place:retweeted_status.place, retweet_tweet_favorite_count: retweeted_status.favorite_count, retweet_tweet_filter_level:retweeted_status.filter_level, retweet_tweet_lang: retweeted_status.lang};
                        var topReTweetRecord = {
                            tweet_id: tweet_id,
                            retweet_id: retweet_id,
                            retweet_id_str: retweet_id_str,
                            retweet_user_name: retweet_user_name,
                            retweet_user_screen_name: retweet_user_screen_name,
                            retweet_text: retweet_text,
                            retweet_user_profile_image_url_https: retweet_user_profile_image_url_https,
                            retweet_count: retweet_count,
                            retweet_user_location: retweet_user_location,
                            retweet_user_followers_count: retweeted_status.user.followers_count,
                            retweet_user_friends_count: retweeted_status.user.friends_count,
                            retweet_user_statuses_count: retweeted_status.user.statuses_count,
                            retweet_tweet_lang: retweeted_status.lang,
                            profile_banner_url: profile_banner_url
                        };
                        //}

                        var currentKeyValueTopRetweetsFBHeap = MAX_INT - retweet_count;
                        var reTweetsCountNow = retweet_count;

                        if (highestCountForTopReTweetsActiveUser < retweet_count)
                            highestCountForTopReTweetsActiveUser = retweet_count;

                        if (retweet_id_str in topRetweetsAvailibilityRecord) {
                            var reTweetsCountInHeap = topRetweetsAvailibilityRecord[retweet_id_str].value.retweet_count;
                            if (reTweetsCountNow > reTweetsCountInHeap) {
                                topRetweetsFBHeap.decreaseKey(topRetweetsAvailibilityRecord[retweet_id_str], currentKeyValueTopRetweetsFBHeap);
                                //console.log("Decrease key is done Retweets! from "+ reTweetsCountInHeap +"to "+ reTweetsCountNow);
                                topRetweetsAvailibilityRecord[retweet_id_str].value.retweet_count = reTweetsCountNow;
                            } else {
                                //  if(reTweetsCountNow != reTweetsCountInHeap)
                                //       console.log("Retweets count has decresed from "+ reTweetsCountInHeap +" to "+reTweetsCountNow);
                                //  else
                                //       console.log("Retweets remains same "+ reTweetsCountInHeap +" as "+reTweetsCountNow);
                            }
                        } else {
                            if (topRetweetsFBHeap.size() >= NO_OF_RETWEETS_TOBE_STORED_IN_FILE) {
                                if (reTweetsCountNow < minReTweetsCountInHeap) {
                                    //console.log("Ignored value: "+reTweetsCountNow+" minReTweetsCountInHeap: "+minReTweetsCountInHeap);
                                } else {
                                    let node = topRetweetsFBHeap.insert(currentKeyValueTopRetweetsFBHeap, topReTweetRecord);
                                    topRetweetsAvailibilityRecord[retweet_id_str] = node;
                                }
                            } else {
                                let node = topRetweetsFBHeap.insert(currentKeyValueTopRetweetsFBHeap, topReTweetRecord);
                                topRetweetsAvailibilityRecord[retweet_id_str] = node;
                                if (reTweetsCountNow < minReTweetsCountInHeap)
                                    minReTweetsCountInHeap = reTweetsCountNow;
                            }
                        }
                        //console.log("-----------------------------------------------"+topRetweetsFBHeap.size()+"::::::::"+totalReTweetCount);
                        //-----------------------------------NewCode End Retweets
                    }

                        var tempTweetsStoreObj = tweetObj;
                        tempTweetsStoreObj.tweet_id = tweet.id
                        tempTweetsStoreObj.tweet_id_str = tweet.id_str
                        tempTweetsStoreObj.createdAt= new Date()
                        tempTweetsStoreObj.updatedAt= new Date()
                        tempTweetsStoreArr.push(tempTweetsStoreObj)
                        if (tempTweetsStoreArr.length === 10) {
                            var liveTweetsArr = tempTweetsStoreArr.slice()
                            tempTweetsStoreArr = new Array();
                            //1 for all hashtags, 2 for all keywords, 3 for custom keywords
                            var keywordMapToStore = {};
                            if (trackFlag === 1) {
                                keywordMapToStore["All Hashtags"] = 1;
                            } else if (trackFlag === 2) {
                                keywordMapToStore["All Keywords"] = 1;
                            } else if (trackFlag === 3) {
                                keywordMapToStore = keywordMap;
                            }
                            // collectionHandler.liveTweetsStore(tweetsStore, keywordMapToStore, loggedin_user)
                            var liveTweetsStore = {
                                "tweetsStore": liveTweetsArr,
                                "keywordMapToStore": keywordMapToStore,
                                "loggedin_user": loggedin_user,
                                "tweetsFlag": "L"
                            }
                            sender.publishToQueue("liveTweetsStore", liveTweetsStore); //Initiating
                            tempTweetsStoreArr = [];
                        }
                        // liveTweetsStreamObj.retweet = retweetsArray;
                        liveTweetsStreamObj.entities = tweet.entities
                        liveTweetsStreamObj.username = loginUserDtls.username
                        liveTweetsStreamObj.createdAt= new Date()
                        liveTweetsStreamObj.updatedAt= new Date()
                        var live_tweets_streamer = require('./models/live_tweets_streamers');
                        live_tweets_streamer.collection.insert(liveTweetsStreamObj, function (err, doc) {
                            if (err) {
                                logger.log("error", "FileName:routes.js, FunctionName:processTweet, Error writing document to database. Most likely a duplicate. Refer the Exception = %s", err);
                            } else {
                            }
                        });
                        //Write the tweet to the file for downloading all the tweets.
                        //var tweetPart= tweet_id +"\t"+name+"\t"+"@"+screen_name+"\t"+location+"\t"+tweet_text+"\t"+language +"\t"+user_description +"\n";
                        //fs.appendFile(realPath+'/public/'+fileNameAllTweets, tweetPart, function (err) {});
                        //var dontprocess = 'x';
                        // new logic to suppress influential processing, retweets, most active etc..

                        //if (dontprocess !== 'y'){


                    } else {
                        counterTweets--;
                        console.log("Found and ignored duplicate tweet! :) ");
                    }

                }
                var liveTweetsStreamerModel = require('./models/live_tweets_streamers');
                const pipeline = [
                    { $match: { 'fullDocument.username': loginUserDtls.username }},
                ];
                const changeStream = liveTweetsStreamerModel.watch(pipeline);
                changeStream.on('change', (next) => {
                    let streamingData = next.fullDocument;
                    processTweetsFromMongo(streamingData);
                });

                function processTweetsFromMongo(tweetObj){
                    var name = tweetObj.name;
                    var user_id = tweetObj.id;
                    var screen_name = tweetObj.screen_name;
                    var location = tweetObj.location;
                    var followers_count = tweetObj.followers_count;
                    var friends_count = tweetObj.friends_count;
                    var profile_banner_url = tweetObj.profile_banner_url;
                    var statuses_count = tweetObj.statuses_count;
                    var profile_image_url_https = tweetObj.profile_image_url_https;
                    var tweet_id = tweetObj.tweet_id;
                    var tweet_id_str = tweetObj.tweet_id_str;
                    var id_str = tweetObj.id_str;
                    var language = tweetObj.language;
                    var user_description = tweetObj.description;
                    var retweeted_status = tweetObj.retweeted_status;
                    var favorites_count = tweetObj.favourites_count;
                    var created_at_time = tweetObj.created_at;
                    var utc_offset = tweetObj.utc_offset;
                    var time_zone = tweetObj.time_zone;
                    var geo_enabled = tweetObj.geo_enabled;
                    var geo = tweetObj.geo;
                    var coordinates = tweetObj.coordinates;
                    var source = tweetObj.source;
                    let tweet= tweetObj;

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

                    var influentialUserRecord = {
                        name: name,
                        user_id: user_id,
                        screen_name: screen_name,
                        followers_count: followers_count,
                        followers_count_display: followers_count,
                        profile_image_url_https: profile_image_url_https,
                        statuses_count: statuses_count,
                        statuses_count_display: statuses_count,
                        friends_count: friends_count,
                        friends_count_display: friends_count,
                        profile_banner_url: profile_banner_url,
                        friends_count: tweetObj.friends_count,
                        language: language,
                        location: location,
                        last_refreshed: moment(new Date()).format('HH:MM:SS')
                    };
                    // var influentialUserRecord = {name:name, screen_name:screen_name, followers_count:followers_count, profile_image_url_https:profile_image_url_https, statuses_count:statuses_count};
                    var currentKeyValueInfluentialUsersFBHeap = MAX_INT - followers_count;
                    var followersCountNow = followers_count;

                    if (highestCount < followers_count)
                        highestCount = followers_count;

                    //----------------------------------NewCode MostInfluential users
                    if (screen_name in influentialUsersAvailibilityRecord) {
                        var followersCountInHeap = influentialUsersAvailibilityRecord[screen_name].value.followers_count;
                        if (followersCountNow > followersCountInHeap) {
                            influentialUsersFBHeap.decreaseKey(influentialUsersAvailibilityRecord[screen_name], currentKeyValueInfluentialUsersFBHeap);
                            //console.log("Decrease key is done Influential users! from "+ followersCountInHeap +"to "+ followersCountNow);
                            influentialUsersAvailibilityRecord[screen_name].value.followers_count = followersCountNow;
                        } else {
                            //  if(followersCountNow != followersCountInHeap)
                            //       console.log("Followers count has decresed from "+ followersCountInHeap +" to "+followersCountNow);
                            //  else
                            //       console.log("Followers remains same "+ followersCountInHeap +" as "+followersCountNow);
                        }
                    } else {
                        if (influentialUsersFBHeap.size() >= NO_OF_INFLUENTIAL_USERS_TOBE_STORED_IN_FILE) {
                            if (followersCountNow < minFollowersCountInHeap) {
                                //console.log("Ignored value: "+followersCountNow+" minFollowersCountInHeap: "+minFollowersCountInHeap);
                            } else {
                                let node = influentialUsersFBHeap.insert(currentKeyValueInfluentialUsersFBHeap, influentialUserRecord);
                                influentialUsersAvailibilityRecord[screen_name] = node;
                            }
                        } else {
                            let node = influentialUsersFBHeap.insert(currentKeyValueInfluentialUsersFBHeap, influentialUserRecord);
                            influentialUsersAvailibilityRecord[screen_name] = node;
                            if (followersCountNow < minFollowersCountInHeap)
                                minFollowersCountInHeap = followersCountNow;
                        }
                    }
                    //console.log("-----------------------------------------------"+influentialUsersFBHeap.size()+"::::::::"+totalTweetCount);
                    //-----------------------------------NewCode End MostInfluential users
                    var activeUserRecord = {
                        name: name,
                        user_id: user_id,
                        screen_name: screen_name,
                        followers_count: followers_count,
                        followers_count_display: followers_count,
                        profile_image_url_https: profile_image_url_https,
                        statuses_count: statuses_count,
                        statuses_count_display: statuses_count,
                        friends_count: friends_count,
                        friends_count_display: friends_count,
                        profile_banner_url: profile_banner_url,
                        friends_count: tweetObj.friends_count,
                        language: language,
                        location: location,
                        last_refreshed: moment(new Date()).format('HH:MM:SS')
                    };
                    // var activeUserRecord = {name:name, screen_name:screen_name, followers_count:followers_count, profile_image_url_https:profile_image_url_https, statuses_count: statuses_count};
                    var currentKeyValueActiveUsersFBHeap = MAX_INT - statuses_count;
                    var tweetsCountNow = statuses_count;


                    if (highestCountForTweetsActiveUser < statuses_count)
                        highestCountForTweetsActiveUser = statuses_count;

                    //----------------------------------NewCode MostActive users
                    if (screen_name in activeUsersAvailibilityRecord) {
                        var tweetsCountInHeap = activeUsersAvailibilityRecord[screen_name].value.statuses_count;
                        if (tweetsCountNow > tweetsCountInHeap) {
                            activeUsersFBHeap.decreaseKey(activeUsersAvailibilityRecord[screen_name], currentKeyValueActiveUsersFBHeap);
                            //console.log("Decrease key is done Active users! from "+ tweetsCountInHeap +"to "+ tweetsCountNow);
                            activeUsersAvailibilityRecord[screen_name].value.statuses_count = tweetsCountNow;
                        } else {
                            //  if(tweetsCountNow != tweetsCountInHeap)
                            //       console.log("Tweets count has decresed from "+ tweetsCountInHeap +" to "+ tweetsCountNow);
                            //  else
                            //       console.log("Tweets count remains same "+ tweetsCountInHeap +" as "+ tweetsCountNow);
                        }
                    } else {
                        if (activeUsersFBHeap.size() >= NO_OF_ACTIVE_USERS_TOBE_STORED_IN_FILE) {
                            if (tweetsCountNow < minTweetsCountInHeap) {
                                //console.log("Ignored value: "+tweetsCountNow+" minTweetsCountInHeap: "+minTweetsCountInHeap);
                            } else {
                                let node = activeUsersFBHeap.insert(currentKeyValueActiveUsersFBHeap, activeUserRecord);
                                activeUsersAvailibilityRecord[screen_name] = node;
                            }
                        } else {
                            let node = activeUsersFBHeap.insert(currentKeyValueActiveUsersFBHeap, activeUserRecord);
                            activeUsersAvailibilityRecord[screen_name] = node;
                            if (tweetsCountNow < minTweetsCountInHeap)
                                minTweetsCountInHeap = tweetsCountNow;
                        }
                    }
                    //console.log("-----------------------------------------------"+activeUsersFBHeap.size()+"::::::::"+totalTweetCount);
                    //-----------------------------------NewCode MostActive users



                    //console.log(totalTweetCount + "\t" + totalRetweetCount);
                    //console.log("Before: "+tweet.text);
                    //var str = tweet.text;
                    text = mixinComp.get_tweet_text(tweet);
                    var hashtags = tweet.entities.hashtags;
                    var user_mentions = tweet.entities.user_mentions;
                    // var urls = tweet.entities.urls;
                    // var symbols = tweet.entities.symbols
                    if (hashtags.length != 0) {
                        hashtagTweets++;
                        socket.emit('showhashtag', hashtagTweets);
                        for (var i = 0; i < hashtags.length; i++) {
                            var hashtag = '#' + hashtags[i].text;
                            var hashTagOriginal = hashtag;
                            text = text.replace(hashtag, '');
                            hashtag = hashtag.toLowerCase();
                            if (typeof(map[hashtag]) == "undefined") {
                                map[hashtag] = [1, Date.now(), 1, hashTagOriginal, [tweet.id_str]];
                            } else {
                                map[hashtag][0]++;
                                map[hashtag][1] = Date.now();
                                if (Array.isArray(map[hashtag][4])) {
                                    map[hashtag][4].push(tweet.id_str)
                                } else {
                                    map[hashtag][4] = [tweet.id_str]
                                }

                            }
                        }
                    }
                    if (trackFlag != 1 && user_mentions.length != 0) {
                        usermentionTweets++;
                        socket.emit('showmentioned', usermentionTweets);
                        for (let i = 0; i < user_mentions.length; i++) {
                            var user_mention = '@' + user_mentions[i].screen_name;
                            var user_mention_original = user_mention;
                            text = text.replace(user_mention, '');
                            user_mention = user_mention.toLowerCase();
                            if (typeof(map[user_mention]) == "undefined") {
                                if (tweet.retweeted_status && user_mentions[i].id === tweet.retweeted_status.user.id) {
                                    map[user_mention] = [1, Date.now(), 2, user_mention_original, tweet.retweeted_status.user.profile_image_url_https, tweet.retweeted_status.user.profile_banner_url, tweetObj.friends_count, tweetObj.id, tweetObj.followers_count, tweetObj.language, tweetObj.statuses_count, tweetObj.location];
                                } else {
                                    var api_response_code = 0
                                    map[user_mention] = [1, Date.now(), 2, user_mention_original, ''];
                                    // most_mentioned_user_profile(map, user_mention, user_mentions[i].screen_name, api_response_code)
                                }
                            } else {
                                map[user_mention][0]++;
                                map[user_mention][1] = Date.now();
                            }
                        }
                    }

                    function most_mentioned_user_profile(map, user_mention, screen_name, api_response_code) {
                        /*
                        Description: Fetch user details and profile_image based on screen_name
                        */
                        var params = {
                            screen_name: screen_name
                        };
                        if (api_response_code === 0) {
                            api_response_code = 1
                            clientREST.post('users/lookup', params, function(error, accounts, response) {
                                if (!error) {
                                    var profile_image_url_https = accounts[0].profile_image_url_https;
                                    var profile_banner_url = accounts[0].profile_banner_url;
                                    var friends_count = accounts[0].friends_count;
                                    var followers_count = accounts[0].followers_count;
                                    var language = accounts[0].language;
                                    var statuses_count = accounts[0].statuses_count;
                                    var location = accounts[0].location;
                                    map[user_mention][4] = profile_image_url_https;
                                    map[user_mention][5] = profile_banner_url;
                                    map[user_mention][6] = friends_count;
                                    map[user_mention][7] = accounts[0].id;
                                    map[user_mention][8] = followers_count;
                                    map[user_mention][9] = language;
                                    map[user_mention][10] = statuses_count;
                                    map[user_mention][11] = location;
                                    api_response_code = 2
                                } else {
                                    console.log(error);
                                }
                            });
                        }
                        if (api_response_code === 1) {
                            allTimeouts.push(setTimeout(most_mentioned_user_profile, 50, map, user_mention, screen_name, 1)); //Timeout = 50
                        } else if (api_response_code === 2) {
                            return;
                        }
                    }
                    //}
                    // if(trackFlag != 1 && urls.length != 0){
                    //   for(var i=0; i<urls.length; i++){
                    //     var urlT = urls[i].url;
                    //     text = text.replace('/'+urlT+'/g', '');
                    //   }
                    // }
                    // srini added text is equal to tweet.text since text value is not used
                    //if (dontprocess == 'y'){}
                    var text = mixinComp.get_tweet_text(tweet);
                    text = urlify(text);

                    text = text.toLowerCase();
                    //str = urlify(str); //Remove hyperlinks
                    //str = immproveHashTags(str);
                    //str = str.trim().replace(/["~!@#$%^&*\(\)_+=`{}\[\]\|\\:;'<>,.\/?"\- \t\r\n]+/g, '-'); //Remove all special characters
                    text = text.trim().replace(/["~!$%^&*\(\)_+=`{}\[\]\|\\:;'<>,.\/?"\- \t\r\n]+/g, '-'); //Remove all special characters except #
                    text = text.replace(/-/g, " ");

                    //Remove unimportant words from the string
                    //console.log("Before: "+text);
                    //var wordsArray = text.split('-');
                    for (let i = 0; i < unImpLength - 1; i++) {
                        text = text.replace(new RegExp("\\b" + unImp[i] + "\\b", "g"), " ");
                    }
                    text = text.replace(/\s{2,}/g, ' '); //Remove extra space created after removing words
                    var keywordMapKeys = Object.keys(keywordMap)
                    var matchKeysArr = []
                    keywordMapKeys.forEach(function(val, key) {
                        if (/\s/g.test(val)) {
                            var matchKey = text.match(new RegExp(val, "gi"));
                            if (matchKey && matchKey.length > 0) {
                                matchKeysArr.push(matchKey)
                                text = text.replace(new RegExp(val, "gi"), " ")
                            }
                        }
                        createTweetTimelineChartDataset(val, key)
                    })

                    function createTweetTimelineChartDataset(val, index) {
                        var currentTime = moment(new Date());
                        var chartDatasetIndex = 0;
                        if (currentTime.diff(startTime, 'minutes') <= 10 || currentTime.diff(startTime, 'minutes') >= 60) {
                            chartDatasetIndex = 1
                        } else if (currentTime.diff(startTime, 'minutes') <= 20 || currentTime.diff(startTime, 'minutes') >= 90) {
                            chartDatasetIndex = 2
                        } else if (currentTime.diff(startTime, 'minutes') <= 30 || currentTime.diff(startTime, 'minutes') >= 120) {
                            chartDatasetIndex = 3
                        } else if (currentTime.diff(startTime, 'minutes') <= 40 || currentTime.diff(startTime, 'minutes') >= 150) {
                            chartDatasetIndex = 4
                        } else if (currentTime.diff(startTime, 'minutes') <= 50 || currentTime.diff(startTime, 'minutes') >= 180) {
                            chartDatasetIndex = 5
                        } else if (currentTime.diff(startTime, 'minutes') <= 60 || currentTime.diff(startTime, 'minutes') >= 210) {
                            chartDatasetIndex = 6
                        }

                        function randomColorCodeGenerator() {
                            return '#' + (Math.random().toString(16) + "000000").substring(2, 8)
                        }
                        if (text.includes(val)) {
                            if (typeof(chartMap[val]) == "undefined") {
                                chartMap[val] = {
                                    keyword: val,
                                    label: "# of Tweets for " + val,
                                    backgroundColor: mixinComp.randomColorCodeGenerator(),
                                    borderColor: mixinComp.randomColorCodeGenerator(),
                                    data: [0, 0, 0, 0, 0, 0, 0],
                                    fill: 'false'
                                }
                            } else {
                                chartMap[val]['data'][chartDatasetIndex]++
                            }
                        }
                    }
                    text = text.replace(/\s{2,}/g, ' '); //Remove extra space created after removing words
                    //console.log("After: "+text);
                    // console.log("unImpLengthHere: "+unImpLength);

                    //str = str.replace(/\s{2,}/g, ' '); //Remove extra space created after removing words
                    //Remove extra space

                    var strArray = text.split(' ');
                    if (matchKeysArr.length > 0) {
                        strArray = strArray.concat(_.flatten(matchKeysArr))
                    }
                    if (trackFlag != 1) {
                        strArray.forEach(function(entry) {
                            if (entry.length > 1) {
                                if (typeof(map[entry]) == "undefined") {
                                    map[entry] = [1, Date.now(), 3, "", [tweet.id_str]];
                                } else {
                                    map[entry][0]++;
                                    map[entry][1] = Date.now();
                                    if (Array.isArray(map[entry][4])) {
                                        map[entry][4].push(tweet.id_str)
                                    } else {
                                        map[entry][4] = [tweet.id_str]
                                    }
                                }
                            }
                        });
                    }
                }

                //socket.on("continuetweet", function(data){
                //if (data == "jobdone" ){
                //console.log("auto saving completed successfully ");
                //}else{
                //console.log("looks like every 5k test failed");
                //}
                //	processTweetsQueue();
                //});

                socket.on("trackallkeywords", function(msg) {
                    resetDS();
                    trackFlag = 2;
                    let data = "a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z";
                    client.track(data);
                    keywordMap[data] = 1;
                    keywordMapSize++;
                });

                socket.on("trackallhashtags", function(msg) {
                    resetDS();
                    trackFlag = 1;
                    let data = "a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z";
                    client.track(data);
                    keywordMap[data] = 1;
                    keywordMapSize++;
                });
                socket.on("track", function(data, keyList) {
                    if (keyList.length > 0) {
                        startTwtDelay = new Date()
                    }
                    tracker(data, keyList);
                });
                socket.on("countryLanguages", function(languages) {
                    logger.log("info", "Selected Language Details: %s", JSON.stringify(languages));
                    for (var val in languages) {
                        if (languages[val])
                            client.language(val);
                        else
                            client.unlanguage(val);
                    }
                    // languages.forEach(function(checked, key){
                    //   debugger
                    //    if(checked)
                    //       client.language(val);
                    //    else
                    //       client.unlanguage(val);
                    // });
                });
                var tracker = function(data, keyList) {
                    // flag = 1;
                    trackFlag = 3;
                    client.track(data);
                    keywordMap[data] = 1;
                    keywordMapSize++;

                    var keywordsListForGTrends = [];
                    for (var item in keywordMap) {
                        keywordsListForGTrends.push({
                            keyword: item
                        });
                    }
                    keywordarray.push(data)
                    keywordstring = data;
                    var searchterms = "Search key terms =  " + keywordstring;
                    var result = keywordstring.split(",");
                    console.log("no.of keywords = " + result.length);
                    logger.log('info', 'no.of keywords = %s', result.length);

                    time = new Date();
                    year = time.getFullYear();
                    month = time.getMonth() + 1;
                    date1 = time.getDate();
                    hour = time.getHours();
                    minutes = time.getMinutes();
                    seconds = time.getSeconds();
                    if (emailTriggerFirstTimeKeyEnter === 0) {
                        email_dict.row_template = `
                            <TR ALIGN="CENTER">
                                <TD>Search Keys</TD>
                                <TD>${(keyList.length>0)?keyList.join(","):"NA"}</TD>
                            </TR>
                            `;
                        var mailOptions = {
                            from: '"Quantum Ventura Tech support" <aswin1906@gmail.com>', // sender address
                            to: 'aswinjose89@gmail.com', // list of receivers
                            subject: 'TweetZoom log-in stat for TwitterPlayFeb ”', // Subject line
                            // text: User_information, // plaintext body
                            //bcc: '"Quantum Ventura Tech Backup" <mike.socal@quantumventura.com>',
                            html: user_info_email_template(email_dict) // html body
                        };
                        //timestampForNodeMailer

                        // send mail with defined transport object

                        transporter.sendMail(mailOptions, function(error, info) {
                            if (error) {
                                return console.log(error);
                            }
                        });
                        emailTriggerFirstTimeKeyEnter = 1;
                    }
                    var totalkeywords = result.length;
                    socket.emit("displaycount", totalkeywords);
                    var jsonString = JSON.stringify(keywordsListForGTrends);
                    console.log("Current set of keywords: " + jsonString);
                    logger.log('info', 'Current set of keywords: %s', jsonString);
                    socket.emit("keywordListChanged", jsonString);
                    //console.log(jsonString);
                }

                socket.on("untrack", function(data) {
                    client.untrack(data);
                    delete keywordMap[data];
                    keywordMapSize--;

                    var keywordsListForGTrends = [];
                    for (var item in keywordMap) {
                        keywordsListForGTrends.push({
                            keyword: item
                        });
                    }
                    var jsonString = JSON.stringify(keywordsListForGTrends);
                    socket.emit("keywordListChanged", jsonString);
                });

                socket.on("untrackall", function(data) {
                    for (var item in keywordMap) {
                        client.untrack(item);
                        delete keywordMap[item];
                        keywordMapSize--;
                    }
                    console.log("trying to send empty!");
                    logger.log('info', 'trying to send empty!');
                    if (trackFlag === 3) {
                        socket.emit("keywordListChanged", "Empty");
                    }
                    resetDS();
                });

                socket.on("StopTracking", function(data) {
                    for (var item in keywordMap) {
                        client.untrack(item);
                        delete keywordMap[item];
                        keywordMapSize--;
                    }
                });

                socket.on("abort", function(data) {
                    sender.publishToQueue("deletePeliasMapStoreQueue");
                    console.log("All the operations aborted!!");
                    logger.log('info', 'All the operations aborted!!');
                    time = new Date();
                    year = time.getFullYear();
                    month = time.getMonth() + 1;
                    date1 = time.getDate();
                    hour = time.getHours();
                    minutes = time.getMinutes();
                    seconds = time.getSeconds();
                    var msg = "Connection logged out for the user: " + loggedin_user;
                    var stats = " (Total tweets: " + totalTweetCount + ", Retweets %: " + (totalRetweetCount / totalTweetCount) * 100 + ", Positive tweets :" + posSentCount + ", Negative tweets :" + negSentCount + ")\n\n"
                    var searchkeys = "  Current set of keywords: " + keywordstring;
                    // fs.appendFile(realPath + '/logger/ApplicationAccess.log', msg + stats, function(err) {});
                    // console.log(msg + stats);
                    logger.log('info', msg + stats);
                    if (keywordarray.length > 0) {
                        bugsnagServer.notify(new Error(keywordarray.join(",")), {
                            severity: 'info'
                        });
                    }
                    email_dict.socket_id = socket.id;
                    email_dict.log_in_out_label = "Log-out @ ";
                    email_dict.log_in_out_time = moment().subtract(1, 'year').format("YYYY-MM-DD hh:mm:ss");
                    email_dict.row_template = `
                            <TR ALIGN="CENTER">
                            <TD>Total tweets</TD>
                            <TD>${totalTweetCount}</TD>
                            </TR>
                            <TR ALIGN="CENTER">
                            <TD>Retweets %</TD>
                            <TD>${(totalRetweetCount / totalTweetCount) * 100}</TD>
                            </TR>
                            <TR ALIGN="CENTER">
                            <TD>Positive tweets</TD>
                            <TD>${posSentCount}</TD>
                            </TR>
                            <TR ALIGN="CENTER">
                            <TD>Negative tweets</TD>
                            <TD>${negSentCount}</TD>
                            </TR>
                            <TR ALIGN="CENTER">
                            <TD>Search Keys</TD>
                            <TD>${(keywordarray.length>0)?keywordarray.join(","):"NA"}</TD>
                            </TR>
                        `;
                    user_info_email_template(email_dict)
                    var mailOptions = {
                        from: '"Quantum Ventura Tech support" <aswin1906@gmail.com>', // sender address
                        to: 'aswinjose89@gmail.com', // list of receivers
                        subject: 'TweetZoom Log-out stats for TwitterplayFeb”', // Subject line
                        // text: User_information, // plaintext body
                        //bcc: '"Quantum Ventura Tech Backup" <mike.socal@quantumventura.com>',
                        html: '<b> Final Status Report   </b>' + '<br><br>' + user_info_email_template(email_dict) + '<br>' + msg // html body
                    };
                    // send mail with defined transport object

                    transporter.sendMail(mailOptions, function(error, info) {
                        if (error) {
                            return console.log(error);
                        }
                        console.log('Message sent: ' + info.response);
                    });

                    //Clearing things
                    for (var item in keywordMap) {
                        client.untrack(item);
                        delete keywordMap[item];
                        keywordMapSize--;
                    }
                    resetDS();
                    clearAllServerDelay(allTimeouts, allServerIntervals);
                    //io.sockets.connected[socket.id].disconnect();
                    // if(flag !== 2 && keywordMapSize!=0){
                    //   if(client!=null && client!='undefined'){
                    //     client.abort();
                    //     console.log("Abort function called!");
                    //   }
                    // }
                    function execCallback(error, stdout, stderr) {
                        console.log(stderr + "------" + error);
                    }

                    //exec("kill -9 "+sentimentProcessID);
                    //console.log("Killed process: "+ sentimentProcessID);
                    //console.log("Socket ID: "+ socket.id + " closed!");
                    allSocketConnection.forEach(function(socket) {
                        socket.disconnect(); //On click on logout then all the sub browser tabs should be logged out
                    });
                    // req.logout();
                    // res.redirect('/');
                });
                socket.on('track_user_audit_log', function(tweetsCount, logoutFlag) {
                    var loggedin_user = req.user.twitter.username;
                    User.findOne({
                        'twitter.username': loggedin_user
                    }, function(userErr, userData) {
                        if (userErr) {
                            logger.log('error', 'Found exception while save in the model User Exception:', userErr);
                        } else {
                            var userAuditLog = {};
                            userAuditLog.user = userData;
                            userAuditLog.total_tweets = tweetsCount
                            userAuditLog.username = loggedin_user
                            userAuditLog.session_id = sessionstorage.getItem('login_session_id')
                            if(logoutFlag && logoutFlag === 'LOGOUT'){
                                userAuditLog.logoutAt = new Date()
                                userAuditLog.logoutStatus = true
                            }
                            else{
                                userAuditLog.logoutAt = null
                                userAuditLog.logoutStatus = false
                            }
                            var UserAuditLog = require('./models/user_audit_log');
                            // var UserAuditLogModel = new UserAuditLog(userAuditLog);
                            UserAuditLog.findOneAndUpdate({"session_id":userAuditLog.session_id},userAuditLog, { upsert: true, new: true, setDefaultsOnInsert: true }, function(err, auditLogData) {
                                if (err) {
                                    logger.log('error', 'Found exception while save in the model UserAuditLogModel Exception:', err)
                                } else {
                                    logger.log('info', 'Audit Log saved successfully')
                                }
                            });
                        }
                    })
                })
                socket.on("get_user_audit_log", function(data) {
                    get_user_audit_log(data)
                })

                function get_user_audit_log(data) {
                    var loggedin_user = req.user.twitter.username;
                    User.findOne({
                        'twitter.username': loggedin_user
                    }, function(userErr, userData) {
                        if (userErr) {
                            logger.log('error', 'Found exception while save in the model User Exception:', userErr);
                        } else {
                            var UserAuditLog = require('./models/user_audit_log');
                            var dateFilter = new Date();
                            if (data === "days") {
                                dateFilter.setDate(dateFilter.getDate() - 10); // Last 10 days
                            } else if (data === "weeks") {
                                dateFilter = new Date(moment().isoWeek(moment().subtract(4, 'w').week())) // Last 4 weeks
                            } else if (data === "months") {
                                dateFilter = new Date(moment().subtract(1, 'year').format("YYYY-MM-DD")) // Last 1 year
                            }
                            UserAuditLog.find({
                                'user': userData._id,
                                "createdAt": {
                                    "$gte": dateFilter
                                }
                            }, function(err, auditLogData) {
                                if (err) {
                                    logger.log('error', 'CustomKeywords Not Found due to the Exception: %s', err);
                                } else {
                                    socket.emit("audit_log_data", auditLogData, data)
                                }
                            });
                        }
                    })
                }
                //******************************************************* Display data Retrival starts************************************************************//
                socket.on('getLangStat', function(data) {
                    var finalStat = new Object();

                    for (var language_id in tweetsCountPerLangMap) {
                        if (language_id != '')
                            finalStat[language_list_obj[language_id]] = tweetsCountPerLangMap[language_id];
                    }
                    //   var jsonStr = JSON.stringify(finalStat);

                    socket.emit("takeLangStat", finalStat);
                });


                socket.on('getSentimentCount', function(data) {
                    var totalsenticount = 0;
                    totalsenticount = negSentCount + posSentCount + neutralSentCount;
                    var sentiCount = new Object();
                    sentiCount["negSentCount"] = negSentCount;
                    sentiCount["posSentCount"] = posSentCount;
                    sentiCount["neutralSentCount"] = neutralSentCount;
                    sentiCount["totalsenticount"] = totalsenticount;
                    //   var jsonStr = JSON.stringify(sentiCount);
                    socket.emit("takeSentimentCount", sentiCount);
                    sentiCount = null;
                });

                var top100KeywordsToStore= [], top100HashtagsToStore= [];
                socket.on("getTopKKeywordsAndHashTags", function(data) {

                    var tmpMap = map;
                    var sortable = [],
                        sortableTemp = [];
                    var onlyHashTags = [],
                        onlyHashTagsTemp = [];
                    var onlyMentions = [],
                        onlyMentionsTemp = []; //Created temp array to avoid application crash due to memory out of heap
                    var entryCounter = 0;
                    for (var item in tmpMap) {
                        if ((tmpMap[item][0] == 1 || tmpMap[item][0] == 2 || tmpMap[item][0] == 3) && (Date.now() - tmpMap[item][1]) / 60000 > 7.0) {
                            delete map[item];
                            continue;
                        }
                        entryCounter++;
                        if (item != '') {
                            if (tmpMap[item][2] === 1) {
                                // debugger
                                onlyHashTags.push({
                                    name: tmpMap[item][3],
                                    size: tmpMap[item][0],
                                    weight: tmpMap[item][0], //For highcharts
                                    // color: "3",
                                    tweet: tmpMap[item][4]
                                });
                                // onlyHashTagsTemp.push({
                                //         name: tmpMap[item][3],
                                //         size: tmpMap[item][0],
                                //         weight: tmpMap[item][0], //For highcharts
                                //     });
                            } else if (tmpMap[item][2] === 2) {
                                // debugger
                                onlyMentions.push({
                                    name: tmpMap[item][3],
                                    size: tmpMap[item][0],
                                    color: "3",
                                    profile_image_url_https: tmpMap[item][4],
                                    profile_banner_url: tmpMap[item][5],
                                    last_refreshed: moment(new Date()).format('HH:MM:SS'),
                                    friends_count: tmpMap[item][6],
                                    user_id: tmpMap[item][7],
                                    followers_count: tmpMap[item][8],
                                    language: tmpMap[item][9],
                                    statuses_count: tmpMap[item][10],
                                    location: tmpMap[item][11],
                                });
                                onlyMentionsTemp.push({
                                    name: tmpMap[item][3],
                                    size: tmpMap[item][0],
                                    color: "3"
                                });
                            }
                            sortable.push({
                                name: item,
                                size: tmpMap[item][0],
                                weight: tmpMap[item][0], //For highcharts
                                // color: "0",
                                tweet: tmpMap[item][4]
                            });
                            // sortableTemp.push({
                            //     name: item,
                            //     size: tmpMap[item][0],
                            //     weight: tmpMap[item][0], //For highcharts
                            // })
                        }
                    }

                    console.log("No of entries in Map: " + entryCounter);
                    console.log("Total tweets: " + counterTweets);
                    sortable.sort(function(a, b) {
                        return b.size - a.size
                    });
                    // sortableTemp.sort(function(a, b) {
                    //     return b.size - a.size
                    // });
                    onlyHashTags.sort(function(a, b) {
                        return b.size - a.size
                    });
                    // onlyHashTagsTemp.sort(function(a, b) {
                    //         return b.size - a.size
                    //     });
                    onlyMentions.sort(function(a, b) {
                        return b.size - a.size
                    });
                    // onlyMentionsTemp.sort(function(a, b) {
                    //     return b.size - a.size
                    // });
                    var arr = sortable.slice(0, 100);
                    var top100HashTags = onlyHashTags.slice(0, 100);
                    top10HashTagsForInsta = top100HashTags;
                    mentionedUsers = onlyMentions.slice(0, NO_OF_MOST_MENTIONED_USERS_TOBE_STORED_IN_FILE);

                    //   var jsonString = JSON.stringify(obj);
                    var obj = new Object();
                    obj.name = "flare";
                    obj.children = arr;
                    top100KeywordsToStore = arr;
                    socket.emit('takeTopKKeywords', obj);
                    obj = null;
                    var tmpObj = new Object();
                    tmpObj.name = "flare";
                    tmpObj.children = top100HashTags;
                    top100HashtagsToStore= top100HashTags;
                    //console.log(tmpObj);
                    //   var jsonStringTop100HashTags = JSON.stringify(tmpObj);
                    //console.log("----------------------------");
                    //console.log(jsonStringTop100HashTags);
                    socket.emit('takeTopKHashtags', tmpObj);
                    tmpObj = null;

                });


                socket.on("getTopKMostInfluentialUsers", function(data) {
                    var TopKUsersTemp = [];
                    var noOfRecords = NO_OF_INFLUENTIAL_USERS_TOBE_STORED_IN_FILE;
                    if (influentialUsersFBHeap.size() < noOfRecords)
                        noOfRecords = influentialUsersFBHeap.size()

                    //console.log("On_Off, Start influential users------------------------------------------------------");
                    for (var i = 0; i < noOfRecords; i++) {
                        var tmpRecord = influentialUsersFBHeap.extractMinimum();
                        TopKUsersTemp.push(tmpRecord.value);
                        if (i == noOfRecords - 1) {
                            minFollowersCountInHeap = tmpRecord.value.followers_count;
                        }
                        //console.log("On_Off, Yes me: "+tmpRecord.value.followers_count+":::::::"+tmpRecord.value.screen_name);
                    }
                    //console.log("On_Off, End influential users------------------------Minimum seen so far"+ minFollowersCountInHeap+"\n\n")

                    influentialUsersAvailibilityRecord = new Object();
                    influentialUsersFBHeap = new FibonacciHeap();
                    for (var i = 0; i < TopKUsersTemp.length; i++) {
                        var key = MAX_INT - TopKUsersTemp[i].followers_count;
                        var node = influentialUsersFBHeap.insert(key, TopKUsersTemp[i]);
                        influentialUsersAvailibilityRecord[TopKUsersTemp[i].screen_name] = node;
                    }

                    TopKUsersTemp = TopKUsersTemp.slice(0, NO_OF_INFLUENTIAL_USERS_TOBE_DISPLAYED);

                    //var total = TopKUsersTemp.length;
                    // console.log("--------------------START Follow--------------------");
                    // for(var i=0; i<TopKUsersTemp.length; i++)
                    //  console.log(TopKUsersTemp[i].name+" "+TopKUsersTemp[i].followers_count);
                    //console.log("--------------------END----"+ highestCount+"----------------\n");

                    //   var jsonString = JSON.stringify(TopKUsersTemp);
                    //io.sockets.connected[socket.id].emit("takeTopKMostInfluentialUsers", jsonString); //*****Change1*****//
                    socket.emit("takeTopKMostInfluentialUsers", TopKUsersTemp);
                    TopKUsersTemp = null;
                });


                socket.on("getTopKMostActiveUsers", function(data) {
                    var TopKUsersTemp = [];
                    var noOfRecords = NO_OF_ACTIVE_USERS_TOBE_STORED_IN_FILE;

                    if (activeUsersFBHeap.size() < noOfRecords)
                        noOfRecords = activeUsersFBHeap.size()

                    //console.log("On_Off, Start Active users---------------------------------------------------")
                    for (var i = 0; i < noOfRecords; i++) {
                        var tmpRecord = activeUsersFBHeap.extractMinimum();
                        TopKUsersTemp.push(tmpRecord.value);
                        if (i == noOfRecords - 1) {
                            minTweetsCountInHeap = tmpRecord.value.statuses_count;
                        }
                        //console.log("On_Off, Tweets "+tmpRecord.value.statuses_count+":::::::"+tmpRecord.value.screen_name);
                    }
                    //console.log("On_Off, End Active users---------------------------------------------------\n\n")

                    activeUsersAvailibilityRecord = new Object();
                    activeUsersFBHeap = new FibonacciHeap();

                    for (var i = 0; i < TopKUsersTemp.length; i++) {
                        var key = MAX_INT - TopKUsersTemp[i].statuses_count;
                        var node = activeUsersFBHeap.insert(key, TopKUsersTemp[i]);
                        activeUsersAvailibilityRecord[TopKUsersTemp[i].screen_name] = node;
                    }


                    TopKUsersTemp = TopKUsersTemp.slice(0, NO_OF_ACTIVE_USERS_TOBE_DISPLAYED);

                    //var total = TopKUsersTemp.length;
                    // console.log("--------------------START Follow--------------------");
                    // for(var i=0; i<TopKUsersTemp.length; i++)
                    //  console.log(TopKUsersTemp[i].name+" "+TopKUsersTemp[i].followers_count);
                    //console.log("--------------------END----"+ highestCount+"----------------\n");

                    //   var jsonString = JSON.stringify(TopKUsersTemp);
                    //io.sockets.connected[socket.id].emit("takeTopKMostInfluentialUsers", jsonString); //*****Change1*****//
                    socket.emit("takeTopKMostActiveUsers", TopKUsersTemp);
                    TopKUsersTemp = null;
                });


                socket.on("getTopKMostMentionedUsers", function(data) {
                    var TopKUsersTemp = mentionedUsers;
                    TopKUsersTemp = TopKUsersTemp.slice(0, NO_OF_MOST_MENTIONED_USERS_TOBE_DISPLAYED);
                    var topNonImageUsers= TopKUsersTemp.filter(x=>x.profile_image_url_https==="")
                    if(topNonImageUsers.length>0){
                        let allNonImageUsrScreenNames = topNonImageUsers.map(m=>m.name.replace("@","")).join(",");
                        var params = {
                            screen_name: allNonImageUsrScreenNames
                        };
                        clientREST.post('users/lookup', params, function(error, accounts, response) {
                            if (!error) {
                                for(let i=0;i< accounts.length;i++){
                                    var profile_image_url_https = accounts[i].profile_image_url_https;
                                    var profile_banner_url = accounts[i].profile_banner_url;
                                    var friends_count = accounts[i].friends_count;
                                    var followers_count = accounts[i].followers_count;
                                    var language = accounts[i].language;
                                    var statuses_count = accounts[i].statuses_count;
                                    var location = accounts[i].location;
                                    var screen_name = accounts[i].screen_name;
                                    TopKUsersTemp.forEach((twtDtl)=>{
                                        if(twtDtl.name.replace("@","") === screen_name){
                                            twtDtl["profile_image_url_https"] = profile_image_url_https;
                                            twtDtl["profile_banner_url"] = (profile_banner_url)?profile_banner_url: "/static/img/avatars/avatar-profile_1280×1280.png";
                                            twtDtl["friends_count"] = friends_count;
                                            twtDtl["followers_count"] = followers_count;
                                            twtDtl["language"] = language;
                                            twtDtl["statuses_count"] = statuses_count;
                                            twtDtl["location"] = location;
                                        }
                                    })
                                }
                                socket.emit("takeTopKMostMentionedUsers", TopKUsersTemp);
                            } else {
                                socket.emit("takeTopKMostMentionedUsers", TopKUsersTemp);
                            }
                        });
                    }
                    else{
                        socket.emit("takeTopKMostMentionedUsers", TopKUsersTemp);
                    }

                });


                socket.on("getTopKMaxReTweets", function(data) {
                    var TopKMaxReTweets = [];
                    var noOfRecords = NO_OF_RETWEETS_TOBE_STORED_IN_FILE;
                    if (topRetweetsFBHeap.size() < noOfRecords)
                        noOfRecords = topRetweetsFBHeap.size()

                    //console.log("On_Off, Start retweets------------------------------------------------------");
                    for (var i = 0; i < noOfRecords; i++) {
                        var tmpRecord = topRetweetsFBHeap.extractMinimum();
                        TopKMaxReTweets.push(tmpRecord.value);
                        if (i == noOfRecords - 1) {
                            minReTweetsCountInHeap = tmpRecord.value.retweet_count;
                        }
                        //console.log("On_Off, Retweets: "+tmpRecord.value.retweet_count+":::::::"+tmpRecord.value.retweet_id);
                    }
                    //console.log("On_Off, End retweets------------------------Minimum seen so far"+ minReTweetsCountInHeap+"\n\n")

                    topRetweetsAvailibilityRecord = new Object();
                    topRetweetsFBHeap = new FibonacciHeap();
                    for (var i = 0; i < TopKMaxReTweets.length; i++) {
                        var key = MAX_INT - TopKMaxReTweets[i].retweet_count;
                        var node = topRetweetsFBHeap.insert(key, TopKMaxReTweets[i]);
                        topRetweetsAvailibilityRecord[TopKMaxReTweets[i].retweet_id_str] = node;
                    }

                    TopKMaxReTweets = TopKMaxReTweets.slice(0, NO_OF_RETWEETS_TOBE_DISPLAYED);
                    // console.log("--------------------START Statuses--------------------");
                    // for(var i=0; i<total; i++)
                    //   console.log(TopKMaxReTweetsTemp[i].retweet_user_name+" "+TopKMaxReTweetsTemp[i].retweet_count);
                    // console.log("--------------------END--------------------\n");
                    //   var jsonString = JSON.stringify(TopKMaxReTweets);
                    //io.sockets.connected[socket.id].emit("takeTopKMostActiveUsers", jsonString); //*****Change1*****//
                    // console.log("------------------Yes here ---------------------");
                    // console.log(jsonString);
                    // console.log("------------------Yes here ends ---------------------");
                    socket.emit("takeTopKMaxReTweets", TopKMaxReTweets, keywordMap);
                    TopKMaxReTweets = null;
                });


                socket.on("getTopKInstaPhotos", function(data) {
                    var tags = top10HashTagsForInsta;
                    var instaData = [];

                    tags.forEach(function(tag) {
                        var t_tag = tag.name.replace(/#/g, "");
                        ig.tag_media_recent(t_tag, function(err, medias, pagination, remaining, limit) {
                            if (!err) {
                                var len = Object.keys(medias).length;
                                if (len >= 1) {
                                    var img_url = medias[0].images.standard_resolution.url;
                                    var profile_link = medias[0].link;
                                    var likes_count = medias[0].likes.count;
                                    var comments_count = medias[0].comments.count;
                                    instaData.push({
                                        img_url: img_url,
                                        profile_link: profile_link,
                                        likes_count: likes_count,
                                        comments_count: comments_count
                                    });
                                }

                                if (instaData.length == 12) {
                                    var jsonString = JSON.stringify(instaData);
                                    socket.emit("takeTopKInstaPhotos", jsonString);
                                }
                            } else {
                                console.log("Insta error: " + err);
                            }
                        });
                    });
                });
                //******************************************************* Display data Retrival ends************************************************************//




                //******************************************************* File Retrival starts************************************************************//
                socket.on('getTopKeywordsFile', function(data) {

                    var tmpMap = map;
                    var sortable = [];

                    for (var item in tmpMap) {
                        if (item != '')
                            sortable.push({
                                name: item,
                                size: tmpMap[item][0]
                            })
                    }

                    console.log("Inside keywords fun!");

                    if (sortable.length != 0) {
                        sortable.sort(function(a, b) {
                            return b.size - a.size
                        });


                        var currentdate = new Date();
                        var datetime = currentdate.getDate() + "-" +
                            (currentdate.getMonth() + 1) + "-" +
                            currentdate.getFullYear() + "-" +
                            currentdate.getHours() + "-" +
                            currentdate.getMinutes() + "-" +
                            currentdate.getSeconds();

                        var filename = loggedin_user_screen_name + '_wordlist_' + datetime + '.xls';
                        var options = {
                            encoding: 'utf8'
                        };
                        var fs = require('fs');
                        var live_tweets_filepath = realPath + '/public/media/files/live_tweets/' + filename;
                        var writerStream = fs.createWriteStream(live_tweets_filepath, options);

                        // var writerStream = fs.createWriteStream(realPath + '/public/' + filename, options);

                        var nCol = 2;
                        var nRow = sortable.length + 1;

                        if (nRow > NO_OF_KEYWORDS_TOBE_STORED_IN_FILE) {
                            nRow = NO_OF_KEYWORDS_TOBE_STORED_IN_FILE;
                        }

                        var row1 = "Word" + "\t" + "Frequency" + "\n";
                        writerStream.on("open", function() {
                            for (var i = 2; i <= nRow; i++) {
                                row1 += sortable[i - 2].name + "\t" + sortable[i - 2].size + "\n";
                            }
                            writerStream.write(row1);
                            // Mark the end of file
                            writerStream.end();
                        });


                        // Handle stream events --> finish, and error
                        writerStream.on('finish', function() {
                            console.log("Write completed.");
                            if (data == "SaveAll") {
                                socket.emit('doneSaveAll', "3");
                            } else {
                                var download_path = app_config.protocol + '://' + app_config.node_machine + app_config.static_url + app_config.download_path + '/live_tweets/' + filename;
                                socket.emit('takeTopKeywordsFile', filename, download_path);
                            }
                        });

                        writerStream.on('error', function(err) {
                            console.log(err.stack);
                        });
                    } else {
                        if (data == "SaveAll") {
                            socket.emit('doneSaveAll', "3");
                        } else {
                            socket.emit('takeTopKeywordsFile', "NoFileExist");
                        }
                    }

                });

                socket.on('storeTopKeywords', function(data) {
                    sharedSvc.setTopKeywords(top100KeywordsToStore);
                    sender.publishToQueue("topKeywordsStoreQueue");
                });

                socket.on('storeTopHashtags', function(data) {
                    sharedSvc.setTopHashtags(top100HashtagsToStore);
                    sender.publishToQueue("topHashtagsStoreQueue");
                });

                socket.on('getAllTweetsFile', function(data) {

                    console.log("tweets array length before writing = " + tweetsArray.length);
                    console.log("tweets in tweet queue before writing  = " + tweetsQueue.length);
                    var tmpTweetsArray = tweetsArray;
                    if (tmpTweetsArray.length != 0) {
                        var path = __dirname;
                        path = path.substring(0, path.length - 4);

                        var currentdate = new Date();
                        var datetime = currentdate.getDate() + "-" +
                            (currentdate.getMonth() + 1) + "-" +
                            currentdate.getFullYear() + "-" +
                            currentdate.getHours() + "-" +
                            currentdate.getMinutes() + "-" +
                            currentdate.getSeconds();

                        var filename = loggedin_user_screen_name + '_sessionId ' + sessioncounter + '_tweetlist_' + datetime + '.xls';
                        var options = {
                            encoding: 'utf8'
                        };
                        var fs = require('fs');
                        var live_tweets_filepath = realPath + '/public/media/files/live_tweets/' + filename;
                        var writerStream = fs.createWriteStream(live_tweets_filepath, options);

                        var nRow = tmpTweetsArray.length + 1;
                        //srini temp area - followers_count, friends_count,profile_banner_url,statuses_count,profile_image_url_https, retweeted_status, favorites_count,created_at_time, utc_offset, time_zone,geo_enabled,geo,coordinates,place,possibly_sensitive, filter_level,
                        var row1 = "Tweet ID" + "\t" + "Tweet ID Str" + "\t" + "created_at" + "\t" + "Name" + "\t" + "Display Name" + "\t" + "Location" + "\t" + "Text" + "\t" + "Language" + "\t" + "User Description" + "\t" + "followers count" + "\t" + "friends count" + "\t" + "profile banner url" + "\t" + "statuses_count" + "\t" + "profile_image_url_https" + "\t" + "favorites_count" + "\t" + "created_at_time" + "\t" + "utc_offset" + "\t" + "time_zone" + "\t" + "geo_enabled" + "\t" + "geo" + "\t" + "coordinates" + "\t" + "place" + "\t" + "possibly_sensitive" + "\t" + " filter_level" + "\t" + " source" + "\t" + " verified" + "\t" + "RT_ID_str" + "\t" + "RT_when_created" + "\t" + "RT_screen_name" + "\t" + "RT_count " + "\n";
                        writerStream.on("open", function() {
                            for (var i = 2; i <= nRow; i++) {
                                row1 += tweetsArray[i - 2].tweet_id + "\t" + tweetsArray[i - 2].tweet_id_str + "\t" + tweetsArray[i - 2].created_at + "\t" + tweetsArray[i - 2].name + "\t" + "@" + tweetsArray[i - 2].screen_name + "\t" + tweetsArray[i - 2].location + "\t" + tweetsArray[i - 2].text + "\t" + tweetsArray[i - 2].language + "\t" + tweetsArray[i - 2].user_description + "\t" + tweetsArray[i - 2].followers_count + "\t" + tweetsArray[i - 2].friends_count + "\t" + tweetsArray[i - 2].profile_banner_url + "\t" + tweetsArray[i - 2].statuses_count + "\t" + tweetsArray[i - 2].profile_image_url_https + "\t" + tweetsArray[i - 2].favorites_count + "\t" + tweetsArray[i - 2].created_at_time + "\t" + tweetsArray[i - 2].utc_offset + "\t" + tweetsArray[i - 2].time_zone + "\t" + tweetsArray[i - 2].geo_enabled + "\t" + tweetsArray[i - 2].geo + "\t" + tweetsArray[i - 2].coordinates + "\t" + tweetsArray[i - 2].place + "\t" + tweetsArray[i - 2].possibly_sensitive + "\t" + tweetsArray[i - 2].filter_level + "\t" + tweetsArray[i - 2].source + "\t" + tweetsArray[i - 2].verified + "\t" + tweetsArray[i - 2].RT_ID_str + "\t" + tweetsArray[i - 2].RT_when_created + "\t" + tweetsArray[i - 2].RT_screen_name + "\t" + tweetsArray[i - 2].RT_count + "\n";
                                if (i > 3 && ((i % 10000) == 0)) {
                                    writerStream.write(row1);
                                    console.log("Writing :" + i);
                                    row1 = "";
                                }
                            }
                            writerStream.write(row1);
                            // Mark the end of file
                            writerStream.end();
                        });


                        // Handle stream events --> finish, and error
                        writerStream.on('finish', function() {
                            console.log("Write completed.");
                            console.log("=======saved CSV records (incl. headers) for session  " + sessioncounter + "= " + nRow);
                            console.log("tweets in tweet queue after writing  = " + tweetsQueue.length);
                            console.log("tweets undelivered due to limits   = " + tweetUndelivered);
                            console.log("no.of tweets with GPS coordinates = " + coordcount);
                            console.log("no.of Retweets with GPS coordinates = " + RTcoordcount);
                            console.log("tweets array length after = " + tweetsArray.length);
                            // Save it
                            // io.sockets.connected[socket.id].emit('taketweetsfile', filename); //****Change1*****//
                            if (data == "justsavethis") {
                                var datalost = tweetsArray.length - nRow;
                                console.log("Tweets array diff between what was saved vs whats now in the array ==== " + datalost);
                                tweetsArray = [];
                                sessioncounter++;
                                //socket.emit('doneitboss', "tempsaved");

                            } else {

                                if (data == "SaveAll") {
                                    socket.emit('doneSaveAll', "4");
                                } else {
                                    var download_path = app_config.protocol + '://' + app_config.node_machine + app_config.static_url + app_config.download_path + '/live_tweets/' + filename;
                                    socket.emit('takeAllTweetsFile', filename, download_path);
                                }
                            }
                        });

                        writerStream.on('error', function(err) {
                            console.log(err.stack);
                        });

                    } else {
                        if (data == "SaveAll") {
                            socket.emit('doneSaveAll', "4");
                        } else {
                            socket.emit('takeAllTweetsFile', "NoFileExist");
                        }
                    }


                });


                socket.on("getTopKMostInfluentialUsersFile", function(data) {
                    var TopKUsersTemp = [];
                    var noOfRecords = NO_OF_INFLUENTIAL_USERS_TOBE_STORED_IN_FILE;
                    if (influentialUsersFBHeap.size() < noOfRecords)
                        noOfRecords = influentialUsersFBHeap.size()

                    //console.log("File Start influential users------------------------------------------------------");
                    for (var i = 0; i < noOfRecords; i++) {
                        var tmpRecord = influentialUsersFBHeap.extractMinimum();
                        TopKUsersTemp.push(tmpRecord.value);
                        if (i == noOfRecords - 1) {
                            let minTopReTweetsCountInHeap = tmpRecord.value.followers_count;
                        }
                        //console.log("File followers: "+tmpRecord.value.followers_count+":::::::"+tmpRecord.value.screen_name);
                    }
                    //console.log("File End influential users------------------------Minimum seen so far"+ minFollowersCountInHeap+"\n\n")

                    influentialUsersAvailibilityRecord = new Object();
                    influentialUsersFBHeap = new FibonacciHeap();
                    for (var i = 0; i < TopKUsersTemp.length; i++) {
                        var key = MAX_INT - TopKUsersTemp[i].followers_count;
                        var node = influentialUsersFBHeap.insert(key, TopKUsersTemp[i]);
                        influentialUsersAvailibilityRecord[TopKUsersTemp[i].screen_name] = node;
                    }
                    if (TopKUsersTemp.length != 0) {
                        var currentdate = new Date();
                        var datetime = currentdate.getDate() + "-" +
                            (currentdate.getMonth() + 1) + "-" +
                            currentdate.getFullYear() + "-" +
                            currentdate.getHours() + "-" +
                            currentdate.getMinutes() + "-" +
                            currentdate.getSeconds();

                        var filename = loggedin_user_screen_name + '_influentialusers_' + datetime + '.xls';
                        var options = {
                            encoding: 'utf8'
                        };
                        var fs = require('fs');
                        var writerStream = fs.createWriteStream(realPath + '/public/media/files/influential_users/' + filename, options);

                        var nRow = TopKUsersTemp.length + 1;
                        var row1 = "Name" + "\t" + "Screen Name" + "\t" + "Number of tweets" + "\t" + "Number of followers" + "\t" + "Twitter Profile" + "\n";
                        writerStream.on("open", function() {
                            for (var i = 2; i <= nRow; i++) {
                                row1 += TopKUsersTemp[i - 2].name + "\t" + TopKUsersTemp[i - 2].screen_name + "\t" + TopKUsersTemp[i - 2].statuses_count + "\t" + TopKUsersTemp[i - 2].followers_count + "\t" + "https://twitter.com/" + TopKUsersTemp[i - 2].screen_name + "\n";
                            }
                            writerStream.write(row1);
                            writerStream.end();
                        });


                        // Handle stream events --> finish, and error
                        writerStream.on('finish', function() {
                            console.log("Write completed.");
                            //Save it
                            //io.sockets.connected[socket.id].emit('getTopKeywordsFile', filename); //*****Change1*****//
                            if (data == "SaveAll") {
                                socket.emit('doneSaveAll', "5");
                            } else {
                                var download_path = app_config.protocol + '://' + app_config.node_machine + app_config.static_url + app_config.download_path + '/influential_users/' + filename;
                                socket.emit('takeTopKMostInfluentialUsersFile', filename, download_path);
                            }
                        });

                        writerStream.on('error', function(err) {
                            console.log(err.stack);
                        });

                    } else {
                        if (data == "SaveAll") {
                            socket.emit('doneSaveAll', "5");
                        } else {
                            socket.emit('takeTopKMostInfluentialUsersFile', "NoFileExist");
                        }
                    }

                });

                socket.on("storeTopKMostInfluentialUsers", function(data) {
                    sharedSvc.setInfluentialUsersFBHeap({
                        "influentialUsersFBHeap": influentialUsersFBHeap
                    });
                    sender.publishToQueue("topMostInfluentialUsersStoreQueue");
                });

                socket.on('getTopKMostActiveUsersFile', function(data) {
                    var TopKUsersTemp = [];
                    var noOfRecords = NO_OF_ACTIVE_USERS_TOBE_STORED_IN_FILE;

                    if (activeUsersFBHeap.size() < noOfRecords)
                        noOfRecords = activeUsersFBHeap.size()

                    //console.log("On_Off, File Start Active users---------------------------------------------------")
                    for (var i = 0; i < noOfRecords; i++) {
                        var tmpRecord = activeUsersFBHeap.extractMinimum();
                        TopKUsersTemp.push(tmpRecord.value);
                        if (i == noOfRecords - 1) {
                            minTweetsCountInHeap = tmpRecord.value.statuses_count;
                        }
                        //console.log("On_Off, File Tweets "+tmpRecord.value.statuses_count+":::::::"+tmpRecord.value.screen_name);
                    }
                    //console.log("On_Off, File End Active users---------------------------------------------------\n\n")

                    activeUsersAvailibilityRecord = new Object();
                    activeUsersFBHeap = new FibonacciHeap();

                    for (var i = 0; i < TopKUsersTemp.length; i++) {
                        var key = MAX_INT - TopKUsersTemp[i].statuses_count;
                        var node = activeUsersFBHeap.insert(key, TopKUsersTemp[i]);
                        activeUsersAvailibilityRecord[TopKUsersTemp[i].screen_name] = node;
                    }

                    if (TopKUsersTemp.length != 0) {
                        var currentdate = new Date();
                        var datetime = currentdate.getDate() + "-" +
                            (currentdate.getMonth() + 1) + "-" +
                            currentdate.getFullYear() + "-" +
                            currentdate.getHours() + "-" +
                            currentdate.getMinutes() + "-" +
                            currentdate.getSeconds();

                        var filename = loggedin_user_screen_name + '_activeusers_' + datetime + '.xls';
                        var options = {
                            encoding: 'utf8'
                        };
                        var fs = require('fs');
                        var writerStream = fs.createWriteStream(realPath + '/public/media/files/active_users/' + filename, options);

                        var nRow = TopKUsersTemp.length + 1;
                        var row1 = "Name" + "\t" + "Screen Name" + "\t" + "Number of tweets" + "\t" + "Number of followers" + "\t" + "Twitter Profile" + "\n";
                        writerStream.on("open", function() {
                            for (var i = 2; i <= nRow; i++) {
                                row1 += TopKUsersTemp[i - 2].name + "\t" + TopKUsersTemp[i - 2].screen_name + "\t" + TopKUsersTemp[i - 2].statuses_count + "\t" + TopKUsersTemp[i - 2].followers_count + "\t" + "https://twitter.com/" + TopKUsersTemp[i - 2].screen_name + "\n";
                            }
                            writerStream.write(row1);
                            writerStream.end();
                        });


                        // Handle stream events --> finish, and error
                        writerStream.on('finish', function() {
                            console.log("Write completed.");
                            if (data == "SaveAll") {
                                socket.emit('doneSaveAll', "6");
                            } else {
                                var download_path = app_config.protocol + '://' + app_config.node_machine + app_config.static_url + app_config.download_path + '/active_users/' + filename;
                                socket.emit('takeTopKMostActiveUsersFile', filename, download_path);
                            }
                        });

                        writerStream.on('error', function(err) {
                            console.log(err.stack);
                        });

                    } else {
                        if (data == "SaveAll") {
                            socket.emit('doneSaveAll', "6");
                        } else {
                            socket.emit('takeTopKMostActiveUsersFile', "NoFileExist");
                        }
                    }

                });

                socket.on("storeTopKMostActiveUsers", function(data) {
                    sharedSvc.setActiveUsersFBHeap({
                        "activeUsersFBHeap": activeUsersFBHeap
                    });
                    sender.publishToQueue("topMostActiveUsersStoreQueue");
                });


                socket.on('getTopKMaxReTweetsFile', function(data) {
                    var TopKMaxReTweets = [];
                    var noOfRecords = NO_OF_RETWEETS_TOBE_STORED_IN_FILE;
                    if (topRetweetsFBHeap.size() < noOfRecords)
                        noOfRecords = topRetweetsFBHeap.size()

                    //console.log("On_Off, File Start retweets------------------------------------------------------");
                    for (var i = 0; i < noOfRecords; i++) {
                        var tmpRecord = topRetweetsFBHeap.extractMinimum();
                        TopKMaxReTweets.push(tmpRecord.value);
                        //if(i == noOfRecords-1){
                        minReTweetsCountInHeap = tmpRecord.value.retweet_count;
                        //}
                        //console.log("On_Off, File Retweets: "+tmpRecord.value.retweet_count+":::::::"+tmpRecord.value.retweet_id);
                    }
                    //console.log("On_Off, File End retweets------------------------Minimum seen so far"+ minReTweetsCountInHeap+"\n\n")

                    topRetweetsAvailibilityRecord = new Object();
                    topRetweetsFBHeap = new FibonacciHeap();
                    for (var i = 0; i < TopKMaxReTweets.length; i++) {
                        var key = MAX_INT - TopKMaxReTweets[i].retweet_count;
                        var node = topRetweetsFBHeap.insert(key, TopKMaxReTweets[i]);
                        topRetweetsAvailibilityRecord[TopKMaxReTweets[i].retweet_id_str] = node;
                    }
                    console.log("total topKMaxRetweets in writing array " + i);
                    //console.log("total Retweet Matches"  + "\t" + totalRetweetMatches);


                    if (TopKMaxReTweets.length != 0) {
                        var currentdate = new Date();
                        var datetime = currentdate.getDate() + "-" +
                            (currentdate.getMonth() + 1) + "-" +
                            currentdate.getFullYear() + "-" +
                            currentdate.getHours() + "-" +
                            currentdate.getMinutes() + "-" +
                            currentdate.getSeconds();

                        var filename = loggedin_user_screen_name + '_top_k_retweets_' + datetime + '.xls';
                        var options = {
                            encoding: 'utf8'
                        };
                        var fs = require('fs');
                        var writerStream = fs.createWriteStream(realPath + '/public/media/files/retweets/' + filename, options);




                        var nRow = TopKMaxReTweets.length + 1;
                        //var row1 = "RT TweetID"+"\t"+"RT ID Str"+"\t"+"User Name"+"\t"+"Screen Name"+"\t"+ "profile image "+"\t"+"RT user location"+"\t"+"Number of retweets"+"\t"+"Text"+"\t"+"Twitter Profile"+"\t"+"RT created_at"+"\t"+"RT_source"+"\t"+ "RT user_url"+"\t"+ "RT user_description"+"\t"+"RT user_followers_count"+"\t"+ "RT user_friends_count"+"\t"+ "RT user_listed_count"+"\t"+ "RT user_favourites_count"+"\t"+ "RT user_statuses_count"+"\t"+ "RT user_created_at"+"\t"+ "RT user_utc_offset"+"\t"+ "RT user_time_zone"+"\t"+ "RT user_geo_enabled"+"\t"+ "RT user_lang"+"\t"+ "RT tweet_coordinates"+"\t"+ "RT tweet_place"+"\t"+ "RT tweet_favorite_count"+"\t"+ "RT tweet_filter_level"+"\t"+ "RT tweet_lang"+"\n";
                        var row1 = "RT TweetID" + "\t" + "RT ID Str" + "\t" + "User Name" + "\t" + "Screen Name" + "\t" + "profile image " + "\t" + "RT user location" + "\t" + "Number of retweets" + "\t" + "Text" + "\t" + "Twitter Profile" + "\n";

                        //var row1 = "RT Tweet ID"+"\t"+"User Name"+"\t"+"Screen Name"+"\t"+"Number of retweets"+"\t"+"Text"+"\t"+"Twitter Profile"+"\n";

                        writerStream.on("open", function() {
                            for (var i = 2; i <= nRow; i++) {
                                //row1 += TopKMaxReTweets[i-2].retweet_id+"\t"+TopKMaxReTweets[i-2].retweet_id_str+"\t"+TopKMaxReTweets[i-2].retweet_user_name+"\t"+TopKMaxReTweets[i-2].retweet_user_screen_name+"\t"+TopKMaxReTweets[i-2].retweet_user_profile_image_url_https+"\t"+TopKMaxReTweets[i-2].retweet_user_location+"\t"+TopKMaxReTweets[i-2].retweet_count+"\t"+ TopKMaxReTweets[i-2].retweet_text+"\t"+"https://twitter.com/"+TopKMaxReTweets[i-2].retweet_user_screen_name+"\t"+TopKMaxReTweets[i-2].retweet_created_at +"\t"+TopKMaxReTweets[i-2].retweet_source+"\t"+TopKMaxReTweets[i-2].retweet_user_url+"\t"+TopKMaxReTweets[i-2].retweet_user_description+"\t"+TopKMaxReTweets[i-2].retweet_user_followers_count+"\t"+TopKMaxReTweets[i-2].retweet_user_friends_count+"\t"+TopKMaxReTweets[i-2].retweet_user_listed_count+"\t"+TopKMaxReTweets[i-2].retweet_user_favourites_count+"\t"+TopKMaxReTweets[i-2].retweet_user_statuses_count+"\t"+TopKMaxReTweets[i-2].retweet_user_created_at+"\t"+TopKMaxReTweets[i-2].retweet_user_utc_offset+"\t"+ TopKMaxReTweets[i-2].retweet_user_time_zone+ "\t"+TopKMaxReTweets[i-2].retweet_user_geo_enabled+ "\t"+TopKMaxReTweets[i-2].retweet_user_lang+"\t"+TopKMaxReTweets[i-2].retweet_tweet_coordinates+"\t"+TopKMaxReTweets[i-2].retweet_tweet_place+"\t"+TopKMaxReTweets[i-2].retweet_tweet_favorite_count+"\t"+TopKMaxReTweets[i-2].retweet_tweet_filter_level+"\t"+TopKMaxReTweets[i-2].retweet_tweet_lang +"\n";
                                row1 += TopKMaxReTweets[i - 2].retweet_id + "\t" + TopKMaxReTweets[i - 2].retweet_id_str + "\t" + TopKMaxReTweets[i - 2].retweet_user_name + "\t" + TopKMaxReTweets[i - 2].retweet_user_screen_name + "\t" + TopKMaxReTweets[i - 2].retweet_user_profile_image_url_https + "\t" + TopKMaxReTweets[i - 2].retweet_user_location + "\t" + TopKMaxReTweets[i - 2].retweet_count + "\t" + TopKMaxReTweets[i - 2].retweet_text + "\t" + "https://twitter.com/" + TopKMaxReTweets[i - 2].retweet_user_screen_name + "\n";

                            }
                            writerStream.write(row1);
                            writerStream.end();
                        });

                        // Handle stream events --> finish, and error
                        writerStream.on('finish', function() {
                            console.log("Write completed.");
                            if (data == "SaveAll") {
                                socket.emit('doneSaveAll', "7");
                            } else {
                                var download_path = app_config.protocol + '://' + app_config.node_machine + app_config.static_url + app_config.download_path + '/retweets/' + filename;
                                socket.emit('takeTopKMaxReTweetsFile', filename, download_path);
                            }
                        });

                        writerStream.on('error', function(err) {
                            console.log(err.stack);
                        });
                    } else {
                        if (data == "SaveAll") {
                            socket.emit('doneSaveAll', "7");
                        } else {
                            socket.emit('takeTopKMaxReTweetsFile', "NoFileExist");
                        }
                    }
                });
                socket.on("storeTopKMaxReTweets", function(data) {
                    sharedSvc.setTopRetweetsFBHeap({
                        "topRetweetsFBHeap": topRetweetsFBHeap
                    });
                    sender.publishToQueue("topKMaxReTweetsStoreQueue");
                });

                socket.on('getFullReTweetsFile', function(data) {
                    // here all unique Retweeted data is saved. The 'getTopKMaxReTweetsFile' socket save top 3000 RTs.

                    var tmpRTweetsArray = retweetsArray;
                    var rtarraycount = tmpRTweetsArray.length;
                    var rtmastercount = topRetweetIdmaster.length;
                    console.log("total Unique Retweets in writing array " + rtarraycount);
                    console.log("total Unique Retweets Master  array " + rtmastercount);



                    if (tmpRTweetsArray.length != 0) {
                        var currentdate = new Date();
                        var datetime = currentdate.getDate() + "-" +
                            (currentdate.getMonth() + 1) + "-" +
                            currentdate.getFullYear() + "-" +
                            currentdate.getHours() + "-" +
                            currentdate.getMinutes() + "-" +
                            currentdate.getSeconds();

                        var filename = loggedin_user_screen_name + '_All_retweets_' + datetime + '.xls';
                        var options = {
                            encoding: 'utf8'
                        };
                        var fs = require('fs');
                        var writerStream = fs.createWriteStream(realPath + '/public/' + filename, options);
                        var nRow = tmpRTweetsArray.length + 1;
                        var row1 = "RT TweetID" + "\t" + "RT ID Str" + "\t" + "User Name" + "\t" + "Screen Name" + "\t" + "profile image " + "\t" + "RT user location" + "\t" + "Number of retweets" + "\t" + "Text" + "\t" + "Twitter Profile" + "\t" + "RT created_at" + "\t" + "RT_source" + "\t" + "RT user_url" + "\t" + "RT user_description" + "\t" + "RT user_followers_count" + "\t" + "RT user_friends_count" + "\t" + "RT user_listed_count" + "\t" + "RT user_favourites_count" + "\t" + "RT user_statuses_count" + "\t" + "RT user_created_at" + "\t" + "RT user_utc_offset" + "\t" + "RT user_time_zone" + "\t" + "RT user_geo_enabled" + "\t" + "RT user_lang" + "\t" + "RT tweet_coordinates" + "\t" + "RT tweet_place" + "\t" + "RT tweet_favorite_count" + "\t" + "RT tweet_filter_level" + "\t" + "RT tweet_lang" + "\n";
                        //var row1 = "RT Tweet ID"+"\t"+"User Name"+"\t"+"Screen Name"+"\t"+"Number of retweets"+"\t"+"Text"+"\t"+"Twitter Profile"+"\n";
                        //"RT TweetID"+"\t"+       retweetsArray[i-2].retweet_id+"\t"+

                        writerStream.on("open", function() {
                            for (var i = 2; i <= nRow; i++) {
                                row1 += retweetsArray[i - 2].retweet_id + "\t" + retweetsArray[i - 2].retweet_id_str + "\t" + retweetsArray[i - 2].retweet_user_name + "\t" + retweetsArray[i - 2].retweet_user_screen_name + "\t" + retweetsArray[i - 2].retweet_user_profile_image_url_https + "\t" + retweetsArray[i - 2].retweet_user_location + "\t" + retweetsArray[i - 2].retweet_count + "\t" + retweetsArray[i - 2].retweet_text + "\t" + "https://twitter.com/" + retweetsArray[i - 2].retweet_user_screen_name + "\t" + retweetsArray[i - 2].retweet_created_at + "\t" + retweetsArray[i - 2].retweet_source + "\t" + retweetsArray[i - 2].retweet_user_url + "\t" + retweetsArray[i - 2].retweet_user_description + "\t" + retweetsArray[i - 2].retweet_user_followers_count + "\t" + retweetsArray[i - 2].retweet_user_friends_count + "\t" + retweetsArray[i - 2].retweet_user_listed_count + "\t" + retweetsArray[i - 2].retweet_user_favourites_count + "\t" + retweetsArray[i - 2].retweet_user_statuses_count + "\t" + retweetsArray[i - 2].retweet_user_created_at + "\t" + retweetsArray[i - 2].retweet_user_utc_offset + "\t" + retweetsArray[i - 2].retweet_user_time_zone + "\t" + retweetsArray[i - 2].retweet_user_geo_enabled + "\t" + retweetsArray[i - 2].retweet_user_lang + "\t" + retweetsArray[i - 2].retweet_tweet_coordinates + "\t" + retweetsArray[i - 2].retweet_tweet_place + "\t" + retweetsArray[i - 2].retweet_tweet_favorite_count + "\t" + retweetsArray[i - 2].retweet_tweet_filter_level + "\t" + retweetsArray[i - 2].retweet_tweet_lang + "\n";
                            }
                            writerStream.write(row1);
                            writerStream.end();
                        });

                        // Handle stream events --> finish, and error
                        writerStream.on('finish', function() {
                            console.log("Write completed.");
                            if (data == "SaveAll") {
                                socket.emit('doneSaveAll', "8");
                            } else {
                                socket.emit('takeFullRTFile', filename);
                            }
                        });

                        writerStream.on('error', function(err) {
                            console.log(err.stack);
                        });
                    } else {
                        if (data == "SaveAll") {
                            socket.emit('doneSaveAll', "8");
                        } else {
                            socket.emit('takeFullRTFile', "NoFileExist");
                        }
                    }
                });

                socket.on("storeFullReTweets", function(data) {
                    sharedSvc.setFullReTweets(retweetsArray);
                    sender.publishToQueue("fullReTweetsStoreQueue");
                });

                socket.on('getPosTweetsFile', function(data) {

                    var tmpTweetsArray = posTweetsArrayAll;

                    if (tmpTweetsArray.length != 0) {
                        var currentdate = new Date();
                        var datetime = currentdate.getDate() + "-" +
                            (currentdate.getMonth() + 1) + "-" +
                            currentdate.getFullYear() + "-" +
                            currentdate.getHours() + "-" +
                            currentdate.getMinutes() + "-" +
                            currentdate.getSeconds();

                        var filename = loggedin_user_screen_name + '_positive_tweetlist_' + datetime + '.xls';
                        var options = {
                            encoding: 'utf8'
                        };
                        var fs = require('fs');
                        var writerStream = fs.createWriteStream(realPath + '/public/' + filename, options);
                        var nRow = tmpTweetsArray.length + 1;


                        var row1 = "Tweet Text" + "\n";
                        writerStream.on("open", function() {
                            for (var i = 2; i <= nRow; i++) {
                                row1 += tweetsArray[i - 2] + "\n";
                                if (i > 3 && ((i % 10000) == 0)) {
                                    writerStream.write(row1);
                                    console.log("Writing :" + i);
                                    row1 = "";
                                }
                            }
                            writerStream.write(row1);
                            console.log("Written pos tweets file");
                            // Mark the end of file
                            writerStream.end();
                        });


                        // Handle stream events --> finish, and error
                        //
                        writerStream.on('finish', function() {
                            console.log("Write completed.");
                            // Save it
                            // io.sockets.connected[socket.id].emit('taketweetsfile', filename); //****Change1*****//
                            if (data == "SaveAll") {
                                socket.emit('doneSaveAll', "2");
                            } else {
                                socket.emit('takePosTweetsFile', filename);
                            }
                        });

                        writerStream.on('error', function(err) {
                            console.log(err.stack);
                        });
                    } else {
                        if (data == "SaveAll") {
                            socket.emit('doneSaveAll', "2");
                        } else {
                            socket.emit('takePosTweetsFile', "NoFileExist");
                        }
                    }


                });
                socket.on("storePosTweets", function(data) {
                    sharedSvc.setPosTweets(posTweetsArrayAll);
                    sender.publishToQueue("storePosTweetsStoreQueue");
                });

                socket.on('getNegTweetsFile', function(data) {

                    var tmpTweetsArray = negTweetsArrayAll;

                    if (tmpTweetsArray.length != 0) {
                        var currentdate = new Date();
                        var datetime = currentdate.getDate() + "-" +
                            (currentdate.getMonth() + 1) + "-" +
                            currentdate.getFullYear() + "-" +
                            currentdate.getHours() + "-" +
                            currentdate.getMinutes() + "-" +
                            currentdate.getSeconds();

                        var filename = loggedin_user_screen_name + '_negative_tweetlist_' + datetime + '.xls';
                        var options = {
                            encoding: 'utf8'
                        };
                        var fs = require('fs');
                        var writerStream = fs.createWriteStream(realPath + '/public/' + filename, options);
                        var nRow = tmpTweetsArray.length + 1;

                        var row1 = "Tweet Text" + "\n";
                        writerStream.on("open", function() {
                            for (var i = 2; i <= nRow; i++) {
                                row1 += tweetsArray[i - 2] + "\n";
                                if (i > 3 && ((i % 10000) == 0)) {
                                    writerStream.write(row1);
                                    console.log("Writing :" + i);
                                    row1 = "";
                                }
                            }
                            writerStream.write(row1);
                            // Mark the end of file
                            writerStream.end();
                        });


                        // Handle stream events --> finish, and error
                        writerStream.on('finish', function() {
                            console.log("Write completed.");
                            // Save it
                            // io.sockets.connected[socket.id].emit('taketweetsfile', filename); //****Change1*****//
                            if (data == "SaveAll") {
                                socket.emit('doneSaveAll', "1");
                            } else {
                                socket.emit('takeNegTweetsFile', filename);
                            }

                        });

                        writerStream.on('error', function(err) {
                            console.log(err.stack);
                        });
                    } else {

                        if (data == "SaveAll") {
                            socket.emit('doneSaveAll', "1");
                        } else {
                            socket.emit('takeNegTweetsFile', "NoFileExist");
                        }
                    }

                });

                socket.on("storeNegTweets", function(data) {
                    sharedSvc.setNegTweets(negTweetsArrayAll);
                    sender.publishToQueue("storeNegTweetsStoreQueue");
                });
                socket.on("storeBalanceLiveTweets", function() { // Its helps to store all the non saved balanced tweets from the tweetsArray object

                    if (tempTweetsStoreArr && tempTweetsStoreArr.length > 0) {
                        //1 for all hashtags, 2 for all keywords, 3 for custom keywords
                        var balancedKeywordMapToStore = {}
                        if (trackFlag === 1) {
                            var data = "All Hashtags";
                            balancedKeywordMapToStore[data] = 1;
                        } else if (trackFlag === 2) {
                            var data = "All Keywords";
                            balancedKeywordMapToStore[data] = 1;
                        } else if (trackFlag === 3) {
                            balancedKeywordMapToStore = keywordMap;
                        }
                        var balancedTweetsStore = {
                            "tweetsStore": [],
                            "keywordMapToStore": balancedKeywordMapToStore,
                            "loggedin_user": loginUserDtls.username,
                            "tweetsFlag": "R"
                        }
                        sharedSvc.setBalancedTweets(tempTweetsStoreArr);
                        sender.publishToQueue("balancedLiveTweetsStore", balancedTweetsStore);
                    }
                })
                socket.on("storeBufferedTweets", function() {
                    var bufferedTweetsArr = tweetsQueue.slice()
                    if (tweetsQueue.length > 0) {
                        //1 for all hashtags, 2 for all keywords, 3 for custom keywords
                        var bufferedKeywordMapToStore = {}
                        if (trackFlag === 1) {
                            var data = "All Hashtags";
                            bufferedKeywordMapToStore[data] = 1;
                        } else if (trackFlag === 2) {
                            var data = "All Keywords";
                            bufferedKeywordMapToStore[data] = 1;
                        } else if (trackFlag === 3) {
                            bufferedKeywordMapToStore = keywordMap;
                        }
                        var bufferedTweetsStore = {
                            "tweetsStore": [],
                            "keywordMapToStore": bufferedKeywordMapToStore,
                            "loggedin_user": loginUserDtls.username,
                            "tweetsFlag": "B"
                        }
                        sharedSvc.setBufferedTweets(bufferedTweetsArr);
                        sender.publishToQueue("bufferedTweetsStore", bufferedTweetsStore);
                    }
                })
                socket.on('longlatFile', function(data) {
                    // here all long/lat data for both tweets and retweets are saved.
                    if (longlatarray.length != 0) {
                        console.log("Long/Lat array length before writing = " + longlatarray.length);
                        var tmplonglatArray = longlatarray;
                        var longlatarraycount = tmplonglatArray.length;
                        //var rtmastercount = topRetweetIdmaster.length;
                        console.log("total long/lat entries  in writing array " + longlatarraycount);
                        //console.log ("total Unique Retweets Master  array "+ rtmastercount);
                    }
                    if (longlatarray.length != 0) {
                        var currentdate = new Date();
                        var datetime = currentdate.getDate() + "-" +
                            (currentdate.getMonth() + 1) + "-" +
                            currentdate.getFullYear() + "-" +
                            currentdate.getHours() + "-" +
                            currentdate.getMinutes() + "-" +
                            currentdate.getSeconds();
                        //tw_flag,tweet_id_str, tweet_longitude,tweet_lattitude, tweet_type, TW_country , TW_place_full,TW_place_id, TW_place_short,TW_place_type,TW_place_url
                        // name:name, screen_name:screen_name,location:location
                        var filename = loggedin_user_screen_name + '_sessionId ' + sessionLongLat + '_LongLat_' + datetime + '.xls';
                        var options = {
                            encoding: 'utf8'
                        };
                        var fs = require('fs');
                        var writerStream = fs.createWriteStream(realPath + '/public/' + filename, options);
                        var nRow = tmplonglatArray.length + 1;
                        var row1 = "tw_flag" + "\t" + "UserName" + "\t" + "screen name" + "\t" + "Location" + "\t" + "tweet_id_str" + "\t" + "tweet_longitude" + "\t" + "tweet_lattitude" + "\t" + "tweet_type " + "\t" + "TW_country" + "\t" + "Bounding Box" + "\t" + "TW_place_full" + "\t" + "TW_place_id" + "\t" + "TW_place_short" + "\t" + "TW_place_type" + "\t" + "TW_place_url" + "\t" + "TW_source" + "\t" + "TW_created_at" + "\t" + "TW_Text" + "\n";


                        writerStream.on("open", function() {
                            for (var i = 2; i <= nRow; i++) {
                                row1 += longlatarray[i - 2].tw_flag + "\t" + longlatarray[i - 2].longlat_name + "\t" + longlatarray[i - 2].longlat_screen + "\t" + longlatarray[i - 2].longlat_location + "\t" + longlatarray[i - 2].tweetstring + "\t" + longlatarray[i - 2].longitude + "\t" + longlatarray[i - 2].lattitude + "\t" + longlatarray[i - 2].twtype + "\t" + longlatarray[i - 2].TW_country + "\t" + longlatarray[i - 2].TW_BoundingBox + "\t" + longlatarray[i - 2].TW_place_full + "\t" + longlatarray[i - 2].TW_place_id + "\t" + longlatarray[i - 2].TW_place_short + "\t" + longlatarray[i - 2].TW_place_type + "\t" + longlatarray[i - 2].TW_place_url + "\t" + longlatarray[i - 2].TW_source + "\t" + longlatarray[i - 2].TW_created_at + "\t" + longlatarray[i - 2].TW_Text + "\n";
                            }
                            writerStream.write(row1);
                            writerStream.end();
                        });

                        // Handle stream events --> finish, and error
                        writerStream.on('finish', function() {
                            console.log("Write completed for long/lat " + row1);
                            console.log("=======saved Long/lat  CSV(incl. headers) for session  " + sessionLongLat + "= " + nRow);
                            console.log("Long/lat array length after = " + longlatarray.length);

                            if (data == "justsavethis") {
                                var datalost = longlatarray.length - nRow;
                                console.log("long/lat array diff between what was saved vs whats now in the array ==== " + datalost);
                                longlatarray = [];
                                sessionLongLat++;
                            } else {
                                if (data == "SaveAll") {
                                    longlatarray = [];
                                    socket.emit('doneSaveAll', "9");
                                } else {
                                    socket.emit('takelonglatFile', filename);
                                }
                            }
                        });

                        writerStream.on('error', function(err) {
                            console.log(err.stack);
                        });
                    } else {
                        if (data == "SaveAll") {
                            socket.emit('doneSaveAll', "9");
                        } else {
                            socket.emit('takelonglatFile', "NoFileExist");
                        }
                    }
                });

                socket.on("peliasMap", function(mapMarkerData){
                    sharedSvc.setMapCoordinates(mapMarkerData);
                    sender.publishToQueue("fetchPeliasMapStoreQueue");
                });
                collectionHandler.tempMapChangeStream(socket); // Stream latest data
                // var MapStoreModel = require('./models/temp_map_store');
                // const pipeline = [
                //     { $match: { 'fullDocument.username': loginUserDtls.username } },
                // ];
                // const changeStream = MapStoreModel.watch(pipeline);
                // changeStream.on('change', (next) => {
                //     debugger
                //     let streamingData = next.fullDocument;
                //     socket.emit("getPeliasMap", streamingData);
                // });

                // async function getMapCoordinates(mapMarkerData) {
                //     try {
                //         let pelias_host = app_config["pelias_machine"];
                //         let peliasApiUri = encodeURI(`${pelias_host}/v1/autocomplete?text=${mapMarkerData.msg.user.location}`);
                //         const response = await axios.get(peliasApiUri);
                //         debugger
                //         if(response.status === 200 && response.data["features"].length>0){
                //             debugger
                //             let features = response.data["features"][0];
                //             let mapData = {
                //                 lat: features.geometry.coordinates[1],
                //                 lng: features.geometry.coordinates[0],
                //                 msg: mapMarkerData.msg
                //             };
                //             socket.emit("getPeliasMap", mapData);
                //         }
                //     } catch (error) {
                //         console.error(error);
                //         logger.log('error', 'Sorry, there seems to be an issue with the connection!');
                //         logger.log("error", 'FileName:routes.js, Exception at getMapCoordinates function::%s', error)
                //     }
                // }

                //******************************************************* File Retrival ends************************************************************//

                function resetDS() {

                    map = new Object();
                    tweetsArray = [];

                    influentialUsersAvailibilityRecord = new Object();
                    influentialUsersFBHeap = new FibonacciHeap(); //Maintain top K most influential users (with maximum followers).

                    activeUsersAvailibilityRecord = new Object();
                    activeUsersFBHeap = new FibonacciHeap(); //Maintain top K most active users (with maximum tweets).

                    topRetweetsAvailibilityRecord = new Object();
                    topRetweetsFBHeap = new FibonacciHeap(); //Maintain top K most retweeted tweets.

                    highestCount = 0;
                    highestCountForTweetsActiveUser = 0;
                    highestCountForTopReTweetsActiveUser = 0;
                    minFollowersCountInHeap = MAX_INT;
                    minTweetsCountInHeap = MAX_INT;
                    minReTweetsCountInHeap = MAX_INT;

                    negSentCount = 0;
                    posSentCount = 0;
                    neutralSentCount = 0;

                    for (var language_id in language_list_obj) {
                        tweetsCountPerLangMap[language_id] = 0;
                    }

                    counterTweets = 0;
                    tweetsQueue = [];

                }
                socket.on('singlefollow', function(user_id) {
                    tweets_hdlr.changeFriendship(socket, clientREST, user_id, 'FOLLOW', logger)
                })
                socket.on('singleunfollow', function(user_id) {
                    tweets_hdlr.changeFriendship(socket, clientREST, user_id, 'DESTROY', logger)
                })
                socket.on('hastag_cloud_tweets', function(hastagObj, hashtagName) {
                    hastagCloud.tweets = hastagObj;
                    hastagCloud.name = hashtagName;
                    socket.emit('hastag_cloud_processed', "No Data");
                })
                socket.on('keyword_cloud_tweets', function(keywordObj, keywordName) {
                    keywordCloud.tweets = keywordObj;
                    keywordCloud.name = keywordName;
                    socket.emit('keyword_cloud_processed', "No Data");
                })
                app.get('/influential_users', isLoggedIn, function(req, res) {
                    var TopKUsersTemp = [];
                    var noOfRecords = NO_OF_INFLUENTIAL_USERS_TOBE_DISPLAYED_FOR_FOLLOW;
                    if (influentialUsersFBHeap.size() < noOfRecords)
                        noOfRecords = influentialUsersFBHeap.size()

                    //console.log("On_Off, Start influential users------------------------------------------------------");
                    for (var i = 0; i < noOfRecords; i++) {
                        var tmpRecord = influentialUsersFBHeap.extractMinimum();
                        TopKUsersTemp.push(tmpRecord.value);

                        if (TopKUsersTemp[i].followers_count != undefined)
                            TopKUsersTemp[i].followers_count_display = humanRedable(TopKUsersTemp[i].followers_count);
                        if (TopKUsersTemp[i].statuses_count != undefined)
                            TopKUsersTemp[i].statuses_count_display = humanRedable(TopKUsersTemp[i].statuses_count);
                        if (TopKUsersTemp[i].friends_count != undefined)
                            TopKUsersTemp[i].friends_count_display = humanRedable(TopKUsersTemp[i].friends_count);

                        if (i == noOfRecords - 1) {
                            minFollowersCountInHeap = tmpRecord.value.followers_count;

                            //Render only when all the required records are added to TopKUsersTemp array.
                            // res.render('users_list.ejs', {
                            //     users_data: JSON.stringify(TopKUsersTemp),
                            //     user: req.user, // get the user out of session and pass to template
                            //     socket_con: socket,
                            //     page_name: "Influential Users List"
                            // });
                            console.log(minFollowersCountInHeap + 'minimum followers count heap' + noOfRecords + '  no.of records after the loop');
                        }
                        //console.log('json Array completed');
                        //console.log("On_Off, Yes me: "+tmpRecord.value.followers_count+":::::::"+tmpRecord.value.screen_name);
                    }
                    res.render('users_list.ejs', {
                        users_data: JSON.stringify(TopKUsersTemp),
                        user: req.user, // get the user out of session and pass to template
                        socket_con: socket,
                        page_name: "Influential Users List",
                        appSettings: JSON.stringify(appSettings)
                    });
                    //console.log("On_Off, End influential users------------------------Minimum seen so far"+ minFollowersCountInHeap+"\n\n")

                    influentialUsersAvailibilityRecord = new Object();
                    influentialUsersFBHeap = new FibonacciHeap();
                    for (var i = 0; i < TopKUsersTemp.length; i++) {
                        var key = MAX_INT - TopKUsersTemp[i].followers_count;
                        var node = influentialUsersFBHeap.insert(key, TopKUsersTemp[i]);
                        influentialUsersAvailibilityRecord[TopKUsersTemp[i].screen_name] = node;
                    }
                    io.sockets.once("connection", function(socket) {
                        allSocketConnection.push(socket)
                        socket.on('follow', function(user_ids) {
                            tweets_hdlr.changeMultipleFriendship(socket, clientREST, user_ids, 'FOLLOW', logger)

                        })
                        socket.on('unfollow', function(user_ids) {
                            tweets_hdlr.changeMultipleFriendship(socket, clientREST, user_ids, 'DESTROY', logger)
                        })
                        socket.on('connect_failed', function() {
                            logger.log('error', 'Sorry, there seems to be an issue with the connection!');
                        });
                        socket.on('error', function(err) {
                            bugsnagServer.notify(new Error(err.stack), {
                                severity: 'error'
                            });
                            var random_id = Math.trunc(Math.random() + new Date().getTime());
                            logger.log("error", 'FileName:routes.js, Error Id: %s, Socket Error Exception::%s', random_id, loggedin_user_screen_name, {
                                Exception: err
                            });
                            mixinComp.exceptionEmail(transporter, logger, `TwitterPlay(${loggedin_user_screen_name}): Socket Error Exception`, err.stack, loggedin_user_screen_name, random_id);
                            socket.emit("exception");

                        });
                    });

                });

                app.get('/history_influential_users', isLoggedIn, function(req, res) {
                    try {
                        let page_dtls= {page_name: "Influential Users List"};
                        mixinComp.HistoryUsersView(req, res, page_dtls);
                        io.sockets.once("connection", function(socket) {
                            allSocketConnection.push(socket);
                            socket.on('follow', function(user_ids) {
                                tweets_hdlr.changeMultipleFriendship(socket, clientREST, user_ids, 'FOLLOW', logger)
                            })
                            socket.on('unfollow', function(user_ids) {
                                tweets_hdlr.changeMultipleFriendship(socket, clientREST, user_ids, 'DESTROY', logger)
                            })
                            socket.on('connect_failed', function() {
                                logger.log('error', 'Sorry, there seems to be an issue with the connection!');
                            });
                            socket.on('error', function(err) {
                                bugsnagServer.notify(new Error(err.stack), {
                                    severity: 'error'
                                });
                                var random_id = Math.trunc(Math.random() + new Date().getTime());
                                logger.log("error", 'FileName:routes.js, Error Id: %s, Socket Error Exception::%s', random_id, loggedin_user_screen_name, {
                                    Exception: err
                                });
                                mixinComp.exceptionEmail(transporter, logger, `TwitterPlay(${loggedin_user_screen_name}): Socket Error Exception`, err.stack, loggedin_user_screen_name, random_id);
                                socket.emit("exception");
                            });
                        });
                    } catch (err) {
                        bugsnagServer.notify(new Error(err.stack), {
                            severity: 'error'
                        });
                        var random_id = Math.trunc(Math.random() + new Date().getTime());
                        var loggedin_user = loginUserDtls.username;
                        logger.log("error", 'FileName:routes.js, Error Id: %s ,History Page Influential users Exception for the user:%s', random_id, loggedin_user, {
                            "Exception": err,
                            "ApiName": "history_influential_users"
                        });
                        mixinComp.exceptionEmail(transporter, logger, `TwitterPlay(${loggedin_user}): History Page Influential users API Exception`, err.stack, loggedin_user, random_id);
                        io.sockets.once("connection", function(socket) {
                            socket.emit("exception");
                        });

                    }

                });
                app.get('/history_active_users', isLoggedIn, function(req, res) {
                    try {
                        let page_dtls= {page_name: "Active Users List"};
                        mixinComp.HistoryUsersView(req, res, page_dtls);
                        io.sockets.once("connection", function(socket) {
                            allSocketConnection.push(socket);
                            socket.on('follow', function(user_ids) {
                                tweets_hdlr.changeMultipleFriendship(socket, clientREST, user_ids, 'FOLLOW', logger)
                            })
                            socket.on('unfollow', function(user_ids) {
                                tweets_hdlr.changeMultipleFriendship(socket, clientREST, user_ids, 'DESTROY', logger)
                            })
                            socket.on('connect_failed', function() {
                                logger.log('error', 'Sorry, there seems to be an issue with the connection!');
                            });
                            socket.on('error', function(err) {
                                bugsnagServer.notify(new Error(err.stack), {
                                    severity: 'error'
                                });
                                var random_id = Math.trunc(Math.random() + new Date().getTime());
                                logger.log("error", 'FileName:routes.js, Error Id: %s, Socket Error Exception::%s', random_id, loggedin_user_screen_name, {
                                    Exception: err
                                });
                                mixinComp.exceptionEmail(transporter, logger, `TwitterPlay(${loggedin_user_screen_name}): Socket Error Exception`, err.stack, loggedin_user_screen_name, random_id);
                                socket.emit("exception");
                            });
                        });
                    } catch (err) {
                        bugsnagServer.notify(new Error(err.stack), {
                            severity: 'error'
                        });
                        var random_id = Math.trunc(Math.random() + new Date().getTime());
                        var loggedin_user = loginUserDtls.username;
                        logger.log("error", 'FileName:routes.js, Error Id: %s ,History Page Active users Exception for the user:%s', random_id, loggedin_user, {
                            "Exception": err,
                            "ApiName": "history_active_users"
                        });
                        mixinComp.exceptionEmail(transporter, logger, `TwitterPlay(${loggedin_user}): History Page Active users API Exception`, err.stack, loggedin_user, random_id);
                        io.sockets.once("connection", function(socket) {
                            socket.emit("exception");
                        });
                    }

                });

                app.get('/active_users', isLoggedIn, function(req, res) {
                    var TopKUsersTemp = [];
                    var noOfRecords = NO_OF_ACTIVE_USERS_TOBE_DISPLAYED_FOR_FOLLOW;
                    if (activeUsersFBHeap.size() < noOfRecords)
                        noOfRecords = activeUsersFBHeap.size()

                    //console.log("On_Off, Start influential users------------------------------------------------------");
                    for (var i = 0; i < noOfRecords; i++) {
                        var tmpRecord = activeUsersFBHeap.extractMinimum();
                        TopKUsersTemp.push(tmpRecord.value);

                        if (TopKUsersTemp[i].followers_count != undefined)
                            TopKUsersTemp[i].followers_count_display = humanRedable(TopKUsersTemp[i].followers_count);
                        if (TopKUsersTemp[i].statuses_count != undefined)
                            TopKUsersTemp[i].statuses_count_display = humanRedable(TopKUsersTemp[i].statuses_count);
                        if (TopKUsersTemp[i].friends_count != undefined)
                            TopKUsersTemp[i].friends_count_display = humanRedable(TopKUsersTemp[i].friends_count);

                        console.log("Active users Value of I:" + i);
                        console.log("Starts Aswin checking before render")
                        if (i == noOfRecords - 1) {
                            minTweetsCountInHeap = tmpRecord.value.followers_count;

                        }
                        //console.log("On_Off, Yes me: "+tmpRecord.value.followers_count+":::::::"+tmpRecor.value.screen_name);
                    }
                    res.render('users_list.ejs', {
                        users_data: JSON.stringify(TopKUsersTemp),
                        user: req.user, // get the user out of session and pass to template
                        socket_con: socket,
                        page_name: "Active Users List",
                        appSettings: JSON.stringify(appSettings)
                    });
                    //console.log("On_Off, End influential users------------------------Minimum seen so far"+ minFollowersCountInHeap+"\n\n")
                    // debugger
                    activeUsersAvailibilityRecord = new Object();
                    activeUsersFBHeap = new FibonacciHeap();
                    for (var i = 0; i < TopKUsersTemp.length; i++) {
                        var key = MAX_INT - TopKUsersTemp[i].statuses_count;
                        var node = activeUsersFBHeap.insert(key, TopKUsersTemp[i]);
                        activeUsersAvailibilityRecord[TopKUsersTemp[i].screen_name] = node;
                    }

                    io.sockets.once("connection", function(socket) {
                        allSocketConnection.push(socket)
                        socket.on('follow', function(user_ids) {
                            tweets_hdlr.changeMultipleFriendship(socket, clientREST, user_ids, 'FOLLOW', logger)
                        })
                        socket.on('unfollow', function(user_ids) {
                            tweets_hdlr.changeMultipleFriendship(socket, clientREST, user_ids, 'DESTROY', logger)
                        })
                        socket.on('connect_failed', function() {
                            logger.log('error', 'Sorry, there seems to be an issue with the connection!');
                        });
                        socket.on('error', function(err) {
                            bugsnagServer.notify(new Error(err.stack), {
                                severity: 'error'
                            });
                            var random_id = Math.trunc(Math.random() + new Date().getTime());
                            logger.log("error", 'FileName:routes.js, Error Id: %s, Socket Error Exception::%s', random_id, loggedin_user_screen_name, {
                                Exception: err
                            });
                            mixinComp.exceptionEmail(transporter, logger, `TwitterPlay(${loggedin_user_screen_name}): Socket Error Exception`, err.stack, loggedin_user_screen_name, random_id);
                            socket.emit("exception");
                        });
                    });

                    // console.log(JSON.stringify(TopKUsersTemp));
                });

                app.get('/processLiveTweets', isLoggedIn, function(req, res) {
                    var custom_search_keys = Object.keys(keywordMap)
                    if (custom_search_keys.length > 0) {
                        tweets_hdlr.getLiveTweets(req, http, keywordMap, logger, client, tweetsArray, allSocketConnection);
                    }
                    res.render('dashboard/live_tweets.ejs', {
                        user: req.user, // get the user out of session and pass to template
                        onloadDataCollection: onloadDataCollection,
                        title: "Live Tweets",
                        appSettings: JSON.stringify(appSettings)
                    });
                });

                app.get('/mentioned_users', isLoggedIn, function(req, res) {
                    var mentionedUsersCopy = mentionedUsers;
                    mentionedUsersCopy = mentionedUsers.slice(0, NO_OF_MOST_MENTIONED_USERS_TOBE_DISPLAYED_FOR_FOLLOW);

                    var tempMentionedUsersSet = "";
                    var tempMentionedUsersSetWithFreq = [];
                    var TopKUsersTemp = [];
                    for (var i = 0; i < mentionedUsersCopy.length; i++) {

                        tempMentionedUsersSet += mentionedUsersCopy[i].name.replace('@', '') + ',';
                        if (i === 99 || i === 199 || i === 299 || i === 399 || i === 499 || (i === mentionedUsersCopy.length - 1)) {
                            // if((i!=0 && i%99 == 0) || (i == mentionedUsersCopy.length-1)){
                            var params = {
                                screen_name: tempMentionedUsersSet
                            };
                            // console.log(params);
                            clientREST.post('users/lookup', params, function(error, accounts, response) {
                                if (!error) {
                                    for (var j = 0; j < accounts.length; j++) {
                                        var name = accounts[j].name;
                                        var screen_name = accounts[j].screen_name;
                                        var followers_count = accounts[j].followers_count;
                                        var followers_count_display = humanRedable(accounts[j].followers_count);
                                        var friends_count = accounts[j].friends_count;
                                        var friends_count_display = humanRedable(accounts[j].friends_count);
                                        var profile_banner_url = accounts[j].profile_banner_url;
                                        var statuses_count = accounts[j].statuses_count;
                                        var statuses_count_display = humanRedable(accounts[j].statuses_count);
                                        var profile_image_url_https = accounts[j].profile_image_url_https;
                                        var user_id = accounts[j].id;
                                        // var freq = humanRedable(mentionedUsersCopy[j+(i-99)].size);
                                        let freq = 'N/A';

                                        var mentionedUserRecord = {
                                            name: name,
                                            screen_name: screen_name,
                                            followers_count: followers_count,
                                            followers_count_display: followers_count_display,
                                            profile_image_url_https: profile_image_url_https,
                                            statuses_count: statuses_count,
                                            statuses_count_display: statuses_count_display,
                                            friends_count: friends_count,
                                            friends_count_display: friends_count_display,
                                            profile_banner_url: profile_banner_url,
                                            freq: freq,
                                            user_id: user_id
                                        };
                                        // console.log(mentionedUserRecord);
                                        TopKUsersTemp.push(mentionedUserRecord);
                                        if (i == mentionedUsersCopy.length && j == accounts.length - 1) {
                                            // res.render('users_list.ejs', {
                                            //     users_data: JSON.stringify(TopKUsersTemp),
                                            //     user : req.user, // get the user out of session and pass to template
                                            //     socket_con: socket,
                                            //     page_name : "Mentioned Users List"
                                            // });
                                        }

                                    }
                                    res.render('users_list.ejs', {
                                        users_data: JSON.stringify(TopKUsersTemp),
                                        user: req.user, // get the user out of session and pass to template
                                        socket_con: socket,
                                        page_name: "Mentioned Users List",
                                        appSettings: JSON.stringify(appSettings)
                                    });
                                } else {
                                    logger.log('error', 'Exception: %s', error, {
                                        "fileName": "routes.js",
                                        "apiName": "mentioned_users"
                                    });
                                }
                            });
                            tempMentionedUsersSet = "";
                            tempMentionedUsersSetWithFreq = [];
                        }
                    }

                    io.sockets.once("connection", function(socket) {
                        allSocketConnection.push(socket)
                        socket.on('follow', function(user_ids) {
                            tweets_hdlr.changeMultipleFriendship(socket, clientREST, user_ids, 'FOLLOW', logger)
                        })
                        socket.on('unfollow', function(user_ids) {
                            tweets_hdlr.changeMultipleFriendship(socket, clientREST, user_ids, 'DESTROY', logger)
                        })
                        socket.on('connect_failed', function() {
                            logger.log('error', 'Sorry, there seems to be an issue with the connection!');
                        });
                        socket.on('error', function(err) {
                            bugsnagServer.notify(new Error(err.stack), {
                                severity: 'error'
                            });
                            var random_id = Math.trunc(Math.random() + new Date().getTime());
                            logger.log("error", 'FileName:routes.js, Error Id: %s, Socket Error Exception::%s', random_id, loggedin_user_screen_name, {
                                Exception: err
                            });
                            mixinComp.exceptionEmail(transporter, logger, `TwitterPlay(${loggedin_user_screen_name}): Socket Error Exception`, err.stack, loggedin_user_screen_name, random_id);
                            socket.emit("exception");
                        });
                    });


                });
                app.get('/tweetsCloud', isLoggedIn, function(req, res) {
                    tweetsCloudCntr.tweetsCloudViewTemplate(req, res, app, http, clientREST, logger, [unImp, unImpLength], hastagCloud, keywordCloud, req.query, allSocketConnection)
                    res.render('history/tweets_cloud.ejs', {
                        user: req.user,
                        title: "User Tweets Details",
                        sidebar: false,
                        twitterUserProfile: req.query,
                        appSettings: JSON.stringify(appSettings)
                    });
                });

            });

            app.get('/liveTweetsHistory', isLoggedIn, function(req, res) {
                var User = require('../app/models/user');
                var CustomKeywords = require('../app/models/custom_keywords');
                var LiveTweets = require('../app/models/live_tweets');
                var loggedin_user = req.user.twitter.username;
                io.sockets.once("connection", function(socket) {
                    allSocketConnection.push(socket)
                    socket.on('hastag_cloud_tweets', function(hastagObj, hashtagName) {
                        hastagCloud.tweets = hastagObj;
                        hastagCloud.name = hashtagName;
                        socket.emit('hastag_cloud_processed', "No Data");
                    });
                    socket.on('keyword_cloud_tweets', function(keywordObj, keywordName) {
                        keywordCloud.tweets = keywordObj;
                        keywordCloud.name = keywordName;
                        socket.emit('keyword_cloud_processed', "No Data");
                    });
                    socket.on('singlefollow', function(user_id) {
                        tweets_hdlr.changeFriendship(socket, clientREST, user_id, 'FOLLOW', logger)
                    });
                    socket.on('singleunfollow', function(user_id) {
                        tweets_hdlr.changeFriendship(socket, clientREST, user_id, 'DESTROY', logger)
                    });
                    socket.on('tweetsDownload', function(inputData) {
                        collectionHandler.tweetsDownload(socket, inputData, realPath);
                    });
                });
                res.render('history/live_tweets_history.ejs', {
                    user: req.user,
                    title: "Historical Tweets Analysis",
                    appSettings: JSON.stringify(appSettings)
                });

            });

            app.get('/auditLogs', isLoggedIn, function(req, res) {
                res.render('audit_logs/audit_logs.ejs', {
                    user: req.user,
                    title: "User Audit Log Details",
                    appSettings: JSON.stringify(appSettings)
                });

            });
            app.get('/hashtagCloud', isLoggedIn, function(req, res) {
                try {
                    mixinComp.hashtagCloudView(req, res, http, hastagCloud, appSettings, tweetsArray)
                } catch (err) {
                    var random_id = Math.trunc(Math.random() + new Date().getTime());
                    var loggedin_user= loginUserDtls.username;
                    logger.log("error", 'FileName:routes.js, Error Id: %s ,Hashtag Cloud API Exception for the user:%s', random_id, loggedin_user, {
                        "Exception": err,
                        "ApiName": "hashtagCloud"
                    });
                    mixinComp.exceptionEmail(transporter, logger, `TwitterPlay(${loggedin_user}): Hashtag Cloud API Exception`, err.stack, loggedin_user, random_id);

                    bugsnagServer.notify(new Error(err.stack), {
                        severity: 'error'
                    });
                }
            });
            app.get('/historyHashtagCloud', isLoggedIn, function(req, res) {
                try {
                    mixinComp.historyHashtagCloudView(req, res, http, hastagCloud, appSettings)
                } catch (err) {
                    var random_id = Math.trunc(Math.random() + new Date().getTime());
                    var loggedin_user= loginUserDtls.username;
                    logger.log("error", 'FileName:routes.js, Error Id: %s ,Hashtag Cloud API Exception for the user:%s', random_id, loggedin_user, {
                        "Exception": err,
                        "ApiName": "hashtagCloud"
                    });
                    mixinComp.exceptionEmail(transporter, logger, `TwitterPlay(${loggedin_user}): Hashtag Cloud API Exception`, err.stack, loggedin_user, random_id);

                    bugsnagServer.notify(new Error(err.stack), {
                        severity: 'error'
                    });
                }
            });
            app.get('/keywordCloud', isLoggedIn, function(req, res) {
                try {
                    mixinComp.keywordCloudView(req, res, http, keywordCloud, appSettings, tweetsArray)
                } catch (err) {
                    bugsnagServer.notify(new Error(err.stack), {
                        severity: 'error'
                    });
                    var random_id = Math.trunc(Math.random() + new Date().getTime());
                    var loggedin_user = loginUserDtls.username;
                    logger.log("error", 'FileName:routes.js, Error Id: %s ,Keyword Cloud API Exception for the user:%s', random_id, loggedin_user, {
                        "Exception": err,
                        "ApiName": "keywordCloud"
                    });
                    mixinComp.exceptionEmail(transporter, logger, `TwitterPlay(${loggedin_user}): Hashtag Cloud API Exception`, err.stack, loggedin_user, random_id);
                    io.sockets.once("connection", function(socket) {
                        socket.emit("exception");
                    });
                }
            });
            app.get('/historyKeywordCloud', isLoggedIn, function(req, res) {
                try {
                    mixinComp.HistoryKeywordCloudView(req, res, http, keywordCloud, appSettings)
                } catch (err) {
                    bugsnagServer.notify(new Error(err.stack), {
                        severity: 'error'
                    });
                    var random_id = Math.trunc(Math.random() + new Date().getTime());
                    var loggedin_user = loginUserDtls.username;
                    logger.log("error", 'FileName:routes.js, Error Id: %s ,Keyword Cloud API Exception for the user:%s', random_id, loggedin_user, {
                        "Exception": err,
                        "ApiName": "keywordCloud"
                    });
                    mixinComp.exceptionEmail(transporter, logger, `TwitterPlay(${loggedin_user}): Hashtag Cloud API Exception`, err.stack, loggedin_user, random_id);
                    io.sockets.once("connection", function(socket) {
                        socket.emit("exception");
                    });
                }
            });
            // Starts: Admin
            admin_url.allAdminViewUrl(app, isLoggedIn);
            // Ends: Admin

        });
        require('./helpers/api_router')(app, isLoggedIn, passport, http, appSettings);

        app.get('/givemefile', function(req, res) {
            var filename = req.param('name');
            var path = __dirname;
            path = path.substring(0, path.length - 4);
            var fileLoc = path + '/public/' + filename;
            res.download(fileLoc);
        });

        // =====================================
        // TWITTER ROUTES ======================
        // =====================================
        // route for twitter authentication and login
        app.get('/auth/twitter', passport.authenticate('twitter'));

        // handle the callback after twitter has authenticated the user
        app.get('/auth/twitter/callback',
            passport.authenticate('twitter', {
                successRedirect: '/pricing',
                failureRedirect: '/'
            }));

        // =====================================
        // LOGOUT ==============================
        // =====================================
        app.get('/logout', function(req, res) {
            req.logout();
            req.session.destroy();
            sessionstorage.setItem('login_session_id', null);
            res.redirect('/');
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect: '/profile', // redirect to the secure profile section
            failureRedirect: '/signup', // re  direct back to the signup page if there is an error
            failureFlash: true // allow flash messages
        }));

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect: '/profile', // redirect to the secure profile section
            failureRedirect: '/login', // redirect back to the signup page if there is an error
            failureFlash: true // allow flash messages
        }));

        app.get('/live_twts_data', collectionHandler.getLiveTweetsHistory)
        app.get('/audit_logs_data', collectionHandler.getAuditLogDetails)
        app.get('/getAllUsers', collectionHandler.getAllUsersAPI)
        app.post('/updateTwtsHstryActions', collectionHandler.updateTwtsHstryActions)
        adminCntr.allAdminAPI(app, logger);
    } catch (err) {
        bugsnagServer.notify(new Error(err.stack), {
            severity: 'error'
        });
    }
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {
        if (sessionstorage.getItem('login_session_id') === null) {
            sessionstorage.setItem('login_session_id', Math.floor((Math.random() + Math.floor(Math.random() * 9) + 1) * Math.pow(10, 8)))
        }
        if (req.user) {
            var loggedin_user = req.user.twitter.username;
            global.loginUserDtls = req.user.twitter;
        }
        return next();
    } else {
        clearAllServerDelay(allTimeouts, allServerIntervals);
        // if they aren't redirect them to the home page
        res.redirect('/');
    }

}

function clearAllServerDelay(allTimeouts, allServerIntervals) {
    for (var i = 0; i < allTimeouts.length; i++) {
        clearTimeout(allTimeouts[i]);
    }
    for (var i = 0; i < allServerIntervals.length; i++) {
        clearInterval(allServerIntervals[i]);
    }
}
