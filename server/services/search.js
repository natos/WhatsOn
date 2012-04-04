/**
 *	SearchService
 */

define([

	/** @require */

	//modules
	'util',
	'events',
	'request',

	// config
	'config/global.config'

],


/**
 *	@class SearchService
 */

function(util, events, request, config) {

	/** @constructor */

	var SearchService = function() {

		/** @borrow EventEmitter.constructor */ 
		events.EventEmitter.call(this);

		return this;

	};

	/** @inherits EventEmitter */
	util.inherits(SearchService, events.EventEmitter);


	/** @private */

	var SEARCH_URL = config.API_PREFIX + 'Event.json?query=%%query%%';


	/** @public */

	/** Get events from a query */
	SearchService.prototype.search = function(query) {

		var self = this;

		request(SEARCH_URL.replace(/%%query%%/, query), function(error, response, body) {

			self.emit('search', error, response, body);

		});

		return this;

	};

	/** @return */

	return SearchService;

});