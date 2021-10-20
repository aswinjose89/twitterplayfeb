var _ = require('underscore');
var fs = require('fs');
var moment =require('moment');

function adminUrlHandler() {
}
adminUrlHandler.prototype.allAdminViewUrl = function(app, isLoggedIn){
  app.get('/admin', isLoggedIn, function(req, res){
      res.render('admin.ejs', {
          user : req.user,
          title: "Admin",
      });
  });
  app.get('/admin/appConfigurationForm', isLoggedIn, function(req, res){
      res.render('admin/pages/forms/app_configuration.ejs', {
          user : req.user,
          title: "User Profile Configuration",
      });
  });
  app.get('/admin/pageSetup', isLoggedIn, function(req, res){
      res.render('admin/pages/forms/page_setup.ejs', {
          user : req.user,
          title: "User Screen Configuration",
      });
  });
}
module.exports = adminUrlHandler
