/*
#title           : server.js
#description     : Configure and start the server.
#author		       : Nikul Prajapati
#email           : nikulprajapati90@gmail.com
#date            : 20150717
#version         : 1.0
*/
// server.js
// set up ======================================================================
// get all the tools we need

var express  = require('express');
var app      = express();
const dotenv = require('dotenv');
dotenv.config();
var port     = process.env.PORT || 8085;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var fs = require('fs');
var bugsnag = require('@bugsnag/js');
//var heapdump = require('heapdump');
const {performance, PerformanceObserver} = require('perf_hooks');

var settings = require('./settings.js');
var configDB = require('./config/database.js');


var winstonServer = require('winston-dashboard');
var path = require('path');
var http = require('http').Server(app);
// var https = require('https');
// const https_options = {
//   key: fs.readFileSync('./ssl/self_key.pem'),
//   cert: fs.readFileSync('./ssl/self_cert.pem'),
//   // ca: fs.readFileSync('./ssl/comodorsaaddtrustca.crt')

// };
// // const https_options = {
// //   key: fs.readFileSync("./ssl/key.pem"),
// //   cert: fs.readFileSync("./ssl/key.pem"),
// //   ca: [
// //           fs.readFileSync('path/to/COMODORSAXXXXXXXXXSecureServerCA.crt'),
// //           fs.readFileSync('path/to/COMODORSAAddTrustCA.crt')
// //        ]

// // };
// https = https.Server(https_options, app);
var appSettingsConfig = JSON.parse(fs.readFileSync('config/app_settings.json', 'utf8'));
var pageSettingsConfig = JSON.parse(fs.readFileSync('config/page_settings.json', 'utf8'));
require('./environment.js')(appSettingsConfig);

var app_config = require('./config/app_config.js');
var logger = settings.logger;
global.logger = logger;
global.bugsnagServer = bugsnag('2111bf766b3662c3a3999fe2b0521c84');
global.loginUserDtls = null;
global.app_config = app_config;

try{
  // let i =0;
  // setInterval(function () {
  //   if(i<3){
  //     heapdump.writeSnapshot()
  //   }
  //   i++;
  // }, 6000*30)
  require('events').EventEmitter.prototype._maxListeners = 0;
  // var MongoStore = require('express-session-mongo');
  var MongoStore =  require('connect-mongo')(session);
  // configuration ===============================================================
  mongoose.connect(configDB.url, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
                        .then(() =>  {logger.log('info', 'DB Connected Successfully for %s', configDB.url);})
                        .catch(err => {
                          logger.log('error', 'Failed to connect DB with exception %s', err)
                        }); // connect to our database
  mongoose.set('useFindAndModify', false);

  require('./config/passport')(passport); // pass passport for configuration
  require('./utils/update_ignorelist'); // Loading Ignore List to DB
  require('./utils/data_loading/load_data_to_mongo');

  // set up our express application
  app.use(morgan('dev')); // log every request to the console
  app.use(cookieParser()); // read cookies (needed for auth)
  app.use(bodyParser()); // get information from html forms

  app.set('view engine', 'ejs'); // set up ejs for templating
  // required for passport
  // app.use(session({ secret: 'ilovescotchscotchyscotchscotch', resave : true })); // session secret
  // app.use(session({ store: new MongoStore({ db: 'sessiondb'}), secret: 'ilovescotchscotchyscotchscotch', resave : true }));

  /*Logger Dashboard*/
  winstonServer({
    path: path.join(__dirname, '/logger'), //Root path of the logs (used to not show the full path on the log selector)
    logFiles: '/**/*.log', //Glob to search for logs, make sure you start with a '/'
    port: process.env.WINSTON_PORT || 8086, // Optional custom port, defaults to 8081,
    orderBy: 'creationTime' // 'creationTime' | 'modifiedTime', if none is provided then it will sort by alphabetical order
  });

  app.use(session({
    store: new MongoStore({
      mongooseConnection: mongoose.connection //Using existing mongoose connection.
    }),
    secret: 'thestrongsecret&*$!@#+90hgy5',
    resave: true,
    saveUninitialized: true
  }));
  app.use(passport.initialize());
  app.use(passport.session()); // persistent login sessions
  app.use(flash()); // use connect-flash for flash messages stored in session
var appSettingsModel = require('./app/models/app_settings');
var pageSettings    = require('./app/models/page_settings');
  appSettingsModel.findOneAndUpdate({"version":appSettingsConfig['version']},appSettingsConfig,{ upsert: true, new: true, setDefaultsOnInsert: true },function(err, settings) {
     if (err){
        logger.error('error', 'app_settings Model API Exception: %s', err);
      }
      else{
        pageSettings.findOneAndUpdate({"version":appSettingsConfig['version']},pageSettingsConfig,{ upsert: true, new: true, setDefaultsOnInsert: true },function(err, page_settings) {
           if (err){
              logger.error('error', 'pageSettings Model API Exception: %s', err);
            }
            else{
              var appSettings = JSON.parse(JSON.stringify(settings));
              appSettings['page_settings'] = JSON.parse(JSON.stringify(page_settings));
              require('./environment.js')(appSettings);
              global.appSettings = appSettings;
              require('./app/tasks/sender.js');
              require('./app/tasks/worker.js');
              require('./app/routes.js')(app, passport, http, appSettings); // load our routes and pass in our app and fully configured passport
              app.use('/static', express.static(__dirname + '/public'));
              app.use('/static/'+app_config.download_path+'/live_tweets', express.static(__dirname + '/public/'+app_config.download_path+'/live_tweets'));
              app.use('/static/'+app_config.download_path+'/retweets', express.static(__dirname + '/public/'+app_config.download_path+'/retweets'));
              app.use('/static/'+app_config.download_path+'/influential_users', express.static(__dirname + '/public/'+app_config.download_path+'/influential_users'));
              app.use('/static/'+app_config.download_path+'/active_users', express.static(__dirname + '/public/'+app_config.download_path+'/active_users'));
              app.use('/static/'+app_config.download_path+'/top_keywords', express.static(__dirname + '/public/'+app_config.download_path+'/top_keywords'));
            }
        });

        // Required for showing public files to client. e.g. Images and icons.==========
        //app.use(express.static(__dirname + '/public'));
      }
  });
}
catch(ex){
  logger.log("error", 'Exception at server.js File. Exception = ', ex);
}

// routes ======================================================================

// app.use('/js1', express.static(__dirname + '/Admin/js'));
// app.use('/css1', express.static(__dirname + '/Admin/css'));
// app.use('/plugins', express.static(__dirname + '/Admin/plugins'));
// app.use('/pages', express.static(__dirname + '/Admin/pages'));


app.use('/static', express.static(__dirname + '/public'));
app.use('/static/'+app_config.download_path+'/live_tweets', express.static(__dirname + '/public/'+app_config.download_path+'/live_tweets'));
app.use('/static/'+app_config.download_path+'/retweets', express.static(__dirname + '/public/'+app_config.download_path+'/retweets'));
app.use('/static/'+app_config.download_path+'/influential_users', express.static(__dirname + '/public/'+app_config.download_path+'/influential_users'));
app.use('/static/'+app_config.download_path+'/active_users', express.static(__dirname + '/public/'+app_config.download_path+'/active_users'));
app.use('/static/'+app_config.download_path+'/top_keywords', express.static(__dirname + '/public/'+app_config.download_path+'/top_keywords'));

// console.log("Server sees:"+__dirname + '/public');
logger.log('info', 'Server sees: %s/public', __dirname);
//app.use( express.static( "public" ) );
//app.use( express.static( "./app/public" ) );

//deciding whether to crash when an uncaught exception arrives
//Assuming developers mark known operational errors with error.isOperational=true, read best practice #3


process
      .on('unhandledRejection', function(err) {
        bugsnagServer.notify(new Error(err.stack), {
            severity: 'error'
        });
        var random_id = Math.trunc(Math.random() + new Date().getTime());
        var login_user_name = (loginUserDtls && loginUserDtls.username) ? loginUserDtls.username : "User Undefined";
        logger.log("error", 'FileName:server.js, Error Id: %s ,Unhandled Rejection :%s', random_id, login_user_name, {
            Exception: err
        });

      })
      .on('uncaughtException', function(err) {
        bugsnagServer.notify(new Error(err.stack), {
            severity: 'error'
        });
        var random_id = Math.trunc(Math.random() + new Date().getTime());
        var login_user_name = (loginUserDtls && loginUserDtls.username) ? loginUserDtls.username : "User Undefined";
        logger.log("error", 'FileName:server.js, Error Id: %s ,Unhandled Exception:%s', random_id, login_user_name, {
            Exception: err
        });

      })
      .on('warning', (warning) => {
        logger.log('info', `Node Process Warning Name: ${warning.name}, message: ${warning.message}, stackTrace: ${warning.stack}`);
      });

// process.argv.forEach((val, index) => {
//   console.log(`${index}: ${val}`);
// });


// launch ======================================================================
 http.listen(port);
 logger.log('info', 'Server started running on port %s', port);
