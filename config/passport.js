/*
#title           : passport.js
#description     : Oauth handler
#author		       : Nikul Prajapati
#email           : nikulprajapati90@gmail.com
#date            : 20150717
#version         : 1.0
*/

// config/passport.js

// load all the things we need
var TwitterStrategy  = require('passport-twitter').Strategy;

// load up the user model
var User            = require('../app/models/user');

// load the auth variables
var configAuth = require('./auth');

var Components = require('../app/helpers/components');
// expose this function to our app using module.exports
module.exports = function(passport, callback) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    try{
      var comp = new Components()

      // used to serialize the user for the session
      passport.serializeUser(function(user, done) {
          comp.setLoginSessionDtl(user)
          done(null, user.id);
      });

      // used to deserialize the user
      passport.deserializeUser(function(id, done) {
          User.findById(id, function(err, user) {
              comp.setLoginSessionDtl(user)
              done(err, user);
          });
      });

      // =========================================================================
      // TWITTER =================================================================
      // =========================================================================
      passport.use(new TwitterStrategy({

          consumerKey     : configAuth.twitterAuth.consumerKey,
          consumerSecret  : configAuth.twitterAuth.consumerSecret,
          callbackURL     : configAuth.twitterAuth.callbackURL

      },
      function(token, tokenSecret, profile, done) {

          // make the code asynchronous
      // User.findOne won't fire until we have all our data back from Twitter
          process.nextTick(function() {

              User.findOne({ 'twitter.id' : profile.id }, function(err, user) {

                  // if there is an error, stop everything and return that
                  // ie an error connecting to the database
                  if (err)
                      return done(err);

                  // if the user is found then log them in
                  if (user) {
                      return done(null, user); // user found, return that user
                  } else {
                      // if there is no user, create them
                      var newUser                 = new User();

                      // set all of the user data that we need
                      newUser.twitter.id          = profile.id;
                      newUser.twitter.token       = token;
                      newUser.twitter.username    = profile.username;
                      newUser.twitter.displayName = profile.displayName;
                      newUser.twitter.tokenSecret = tokenSecret;
                      newUser.twitter.imageUrl = profile.photos[0].value;
                      newUser.twitter.loginAt     = new Date();
                      // save our user into the database
                      newUser.save(function(err,userData) {
                          if (err)
                          logger.log("error", 'Exception at passport.js File while saving data. Exception = ', err);
                          else{

                              comp.setLoginSessionDtl(userData)
                          }
                          return done(null, newUser);
                      });
                  }
              });

      });

      }));
    }
    catch(ex){
      logger.log("error", 'Exception at passport.js File. Exception = ', ex);
      process.exit(1);
    }
};
