/**
*	Metadata
*/

define([

/**
*	@requires
*/

	'util',
	'config/global.config',
	'utils/list'

],


/**
*	@class Metadata
*/

function(util, config, List) {

	/** @private */

	var meta = [
		{ property: 'og:title'		, content: config.APP_NAME },
		{ property: 'og:type'		, content: 'app' },
		{ property: 'og:url'		, content: config.APP_URL },
		{ property: 'og:image'		, content: config.APP_LOGO },
		{ property: 'og:site_name'	, content: config.APP_NAME },
		{ property: 'fb:app_id'		, content: config.facebook['app-id'] }
	];


	/** @constructor */

	var Metadata = function() {

		/** @borrow List.constructor */ 
		List.call(this, meta);

//		this.add(meta);

		return this;

	};

	/** @inheritance */
	util.inherits(Metadata, List);


	/** @public */
 
	/** @return */

	return Metadata;

});