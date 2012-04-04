/**
 *	Config for Production environment
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

		'APP_NAME'		: 'WhatsOn!',
		'APP_URL'		: 'http://upcwhatson.herokuapp.com/',
		'APP_LOGO'		: 'http://upcwhatson.herokuapp.com/assets/upclogo.jpg',
		'API_PREFIX'	: 'http://tvgids.upc.nl/cgi-bin/WebObjects/EPGApi.woa/api/',
		'HTML_PREFIX'	: '',
		'facebook'		: {
			'app-id'		: '153316508108487',
			'app-secret'	: '47a04d4b4c794097717593854b7a4e36'
		}
	};

	/** @return */

	return config;

});