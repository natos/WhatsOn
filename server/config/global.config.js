/** NODE_ENV */

var env = process.env.NODE_ENV || 'development';

/**
 *	Config
 */

define([

	/** @require */
	'config/' + env + '.config'
],


/**
 *	config
 */

function(config) {

	return config;

});