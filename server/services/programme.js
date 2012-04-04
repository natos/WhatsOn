/**
 *	ProgrammeService
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
 *	@class ProgrammeService
 */

function(util, events, request, config) {

	/** @constructor */

	var ProgrammeService = function() {

		/** @borrow EventEmitter.constructor */ 
		events.EventEmitter.call(this);

		return this;

	};

	/** @inherits EventEmitter */
	util.inherits(ProgrammeService, events.EventEmitter);


	/** @private */

	var PROGRAMME_DETAILS	= config.API_PREFIX + 'Programme/%%id%%.json',
		PROGRAMME_EVENTS	= config.API_PREFIX + 'Programme/%%id%%/events.json?order=startDateTime';


	/** @public */

	/** Get data from a programme */
	ProgrammeService.prototype.getDetails = function(id) {

		var self = this;

		request(PROGRAMME_DETAILS.replace(/%%id%%/, id), function(error, response, body) {

			self.emit('getDetails', error, response, body);

		});

		return this;

	};

	/** Get list of events from a programme */
	ProgrammeService.prototype.getEvents = function(id) {

		var self = this;

		request(PROGRAMME_EVENTS.replace(/%%id%%/, id), function(error, response, body) {

			self.emit('getEvents', error, response, body);

		});

		return this;
	};

	/** @return */

	return ProgrammeService;

});