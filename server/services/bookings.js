/**
 *	BookingsService
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
 *	@class BookingsService
 */

function(util, events, request, config) {

	/** @constructor */

	var BookingsService = function() {

		/** @borrow EventEmitter.constructor */ 
		events.EventEmitter.call(this);

		return this;

	};

	/** @inherits EventEmitter */
	util.inherits(BookingsService, events.EventEmitter);


	/** @private */

	var TOP_BOOKINGS = 'http://tvgids.upc.nl/cgi-bin/WebObjects/EPGBooking.woa/wa/topBookings';

	var cache;

	/** @public */

	/** Get list of top bookings */
	BookingsService.prototype.getTopBookings = function(id) {

		var self = this;

		if (cache) { 

			self.emit('getTopBookings', '', '', cache);

			return this;

		}

		request(TOP_BOOKINGS, function(error, response, body) {

			self.emit('getTopBookings', error, response, body);

			cache = body;

		});

		return this;
	};

	/** @return */

	return BookingsService;

});