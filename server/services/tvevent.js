/**
 *	TVEventService
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
 *	@class TVEventService
 */

function(util, events, request, config) {

	/** @constructor */

	var TVEventService = function() {

		/** @borrow EventEmitter.constructor */ 
		events.EventEmitter.call(this);

		return this;

	};

	/** @inherits EventEmitter */
	util.inherits(TVEventService, events.EventEmitter);


	/** @private */

	var TV_EVENT_DETAILS = config.API_PREFIX + 'Event/%%id%%.json'

	/** @public */

	/** Get data from an event */
	TVEventService.prototype.getDetails = function(id) {

		var self = this;

		request(TV_EVENT_DETAILS.replace(/%%id%%/, id), function(error, response, body) {

			self.emit('getDetails', error, response, body);

		});

		return this;

	};

	/** @return */

	return TVEventService;

});