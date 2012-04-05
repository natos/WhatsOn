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


	/** @public */

	/** Get list of top bookings */
	BookingsService.prototype.getTopBookings = function(id) {

		var self = this;

		request(TOP_BOOKINGS, function(error, response, body) {

			self.emit('getTopBookings', error, response, body);

		});

		return this;
	};

	/** @return */

	return BookingsService;

});