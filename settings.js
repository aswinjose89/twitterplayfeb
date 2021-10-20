const winston = require('winston');
const util = require('util');

//Refer DOC: https://github.com/winstonjs/winston/blob/master/docs/transports.md
var logger = new winston.Logger({
    transports: [
        new (winston.transports.Console)({
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true,
            formatter: function(options) {
              // - Return string will be passed to logger.
              // - Optionally, use options.colorize(options.level, <string>) to
              //   colorize output based on the log level.
              return new Date().getTime() + ' ' +
                options.level, options.level.toUpperCase() + ' ' +
                (options.message ? options.message : '') +
                (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
            }
          }),
        new (winston.transports.File)({
            name: 'info-file',
            maxsize:'10000000000000000',
            filename: './logger/twitterplay.log',
            handleExceptions: true,
            level: 'info',
            formatter: function(options) {
              // - Return string will be passed to logger.
              // - Optionally, use options.colorize(options.level, <string>) to
              //   colorize output based on the log level.
              return new Date().getTime() + ' ' +
                options.level, options.level.toUpperCase() + ' ' +
                (options.message ? options.message : '') +
                (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
            }
        }),
        new (winston.transports.File)({
            name: 'debug-file',
            maxsize:'10000000000000000',
            filename: './logger/twitterplay.log',
            handleExceptions: true,
            level: 'debug',
            formatter: function(options) {
              // - Return string will be passed to logger.
              // - Optionally, use options.colorize(options.level, <string>) to
              //   colorize output based on the log level.
              return new Date().getTime() + ' ' +
                options.level, options.level.toUpperCase() + ' ' +
                (options.message ? options.message : '') +
                (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
            }
        }),
        new (winston.transports.File)({
            name: 'verbose-file',
            maxsize:'10000000000000000',
            handleExceptions: true,
            filename: './logger/twitterplay.log',
            level: 'verbose',
            formatter: function(options) {
              // - Return string will be passed to logger.
              // - Optionally, use options.colorize(options.level, <string>) to
              //   colorize output based on the log level.
              return new Date().getTime() + ' ' +
                options.level, options.level.toUpperCase() + ' ' +
                (options.message ? options.message : '') +
                (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
            }
        }),
        new (winston.transports.File)({
            name: 'error-file',
            maxsize:'10000000000000000', //100 MB.It should be in bytes
            handleExceptions: true,
            filename: './logger/twitterplay-error.log',
            level: 'error',
        })
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: './logger/twitterplay-error.log',maxsize:'10000000000000000' })
    ],
    exitOnError: false
});

function formatArgs(args){

    return [util.format.apply(util.format, Array.prototype.slice.call(args))];
}
console.log = function(){
    logger.info.apply(logger, formatArgs(arguments));
};
console.info = function(){
    logger.info.apply(logger, formatArgs(arguments));
};
console.warn = function(){
    logger.warn.apply(logger, formatArgs(arguments));
};
console.error = function(){
    logger.error.apply(logger, formatArgs(arguments));
};
console.debug = function(){
    logger.debug.apply(logger, formatArgs(arguments));
};

module.exports = {
    logger: logger
}
