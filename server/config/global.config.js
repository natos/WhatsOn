/** NODE_ENV */

var env = process.env.NODE_ENV || 'development';

/**
 *	Config
 */

define([

	/** @require */
	'config/' + env + '.config',
	'utils/logger'

],


/**
 *	config
 */

function(config, logger) {

	logger.log('config: ' + config['ENV']);
	logger.log('logging messages at level ' + config['LOG_LEVEL'] + ' and higher');
	logger.logLevel = config['LOG_LEVEL'];

	return config;

});