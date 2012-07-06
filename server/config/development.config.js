/**
 *	Config for Testing environment
 */

define([

	/** @require */

],

/**
 *	@class Config
 *	@static
 */

function() {

	var config = {

		'ENV'			: 'development',
		'APP_NAME'		: 'UPC Social',
		'APP_URL'		: 'http://upcsocial.herokuapp.com/',
		'APP_LOGO'		: 'http://upcsocial.herokuapp.com/assets/images/upclogo.jpg',
		// production
		'API_PREFIX'	: 'http://tvgids.upc.nl/cgi-bin/WebObjects/EPGApi.woa/api/',
		// Jedrzej
//		'API_PREFIX'	: 'http://10.65.34.72/cgi-bin/WebObjects/EPGApi.woa/-2004/api/',
		// neo4j on vaca
		//'API_PREFIX'	: 'http://tvgids.upc.nl/cgi-bin/WebObjects/EPGApi-Neo4J.woa/api/',
		'HTML_PREFIX'	: '',
		'facebook'		: {
			'app-id'		: '290742221014129',
			'app-secret'	: '80fc861d131b1dc7a2bed84df09ac32c'
		},
		'PORT'			: 3000
	};

	/** @return */

	return config;

});