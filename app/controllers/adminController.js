var _ = require('underscore');
var fs = require('fs');
var moment = require('moment');
var pageSettings = require('../models/page_settings');
var appSettings = require('../models/app_settings');

function adminController() {}
adminController.prototype.allAdminAPI = function(app, logger) {
    app.get('/admin/getPageSetup', function(req, res) {
        debugger
        var pageSettingsConfig = {};
        if (Object.keys(req.query).length > 0) {
            pageSettingsConfig["footer"] = req.query.footer;
        }
        // "Quantum Ventura &copy; 2019"
        pageSettings.findOneAndUpdate({
            "version": 1
        }, pageSettingsConfig, {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
        }, function(err, settings) {
            if (err) {
                logger.error('error', 'pageSettings Model API Exception: %s', err);
                res.json({
                    "status": "error",
                    msg: err
                });
            } else {
                res.json({
                    "data": settings,
                    "status": "success"
                });
            }
        });
    });
    app.get('/admin/getAppSetup', function(req, res) {
        debugger
        var appSettingsConfig = {};
        if (Object.keys(req.query).length > 0) {
            appSettingsConfig["footer"] = req.query.footer;
        }
        // "Quantum Ventura &copy; 2019"
        appSettings.findOneAndUpdate({
            "version": 1
        }, appSettingsConfig, {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
        }, function(err, settings) {
            if (err) {
                logger.error('error', 'pageSettings Model API Exception: %s', err);
                res.json({
                    "status": "error",
                    msg: err
                });
            } else {
                res.json({
                    "data": settings,
                    "status": "success"
                });
            }
        });
    });
}

module.exports = adminController