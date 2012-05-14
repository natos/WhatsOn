/**
 *	Config for Development environment
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

		'ENV'			: 'test',
		'APP_NAME'		: 'WhatsOn!',
		'APP_URL'		: 'http://upcsocial.herokuapp.com/',
		'APP_LOGO'		: 'http://upcsocial.herokuapp.com/assets/images/upclogo.jpg',
		'API_PREFIX'	: 'http://tvgids.upc.nl/cgi-bin/WebObjects/EPGApi.woa/api/',
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