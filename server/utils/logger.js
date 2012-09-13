/**
*  Logger singleton object. Based on the logger object in r.js
*
*  At the moment, this only outputs to the node.js console, 
*  which forwards to stdout and stderr.
*
*  TODO: log to disk, or to a service somewhere.
*/

define([
    'console'
],

function() {
    var logger = {
        LOG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3,
        SILENT: 4,
        level: 0,
        logPrefix: "",

        logLevel: function( level ) {
            this.level = level;
        },

        log: function (message) {
            if (this.level <= this.LOG) {
                console.log('LOG: ' + this.formatMessage(message));
            }
        },

        info: function (message) {
            if (this.level <= this.INFO) {
                console.info('INFO: ' + this.formatMessage(message));
            }
        },

        warn: function (message) {
            if (this.level <= this.WARN) {
                console.warn('WARN: ' + this.formatMessage(message));
            }
        },

        error: function (message) {
            if (this.level <= this.ERROR) {
                console.time();
                console.error('ERROR: ' + this.formatMessage(message));
            }
        },

        formatMessage: function (message) {
            return ((this.logPrefix ? (this.logPrefix + " ") : "") + new Date() + " " + message);
        }
    };

    return logger;
});
