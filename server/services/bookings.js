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
	'config/global.config',

	// mock
	'mocks/topbookings'

],


/**
 *	@class BookingsService
 */

function(util, events, request, config, TOP_BOOKINGS_MOCK) {

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

			/** API Error? Grab the mock */
			if ( /<title>Error<\/title>/.test(body) ) {

				console.log(' Bookings Service >>> Error getting TopBookings: ', body);

				self.emit('getTopBookings', error, response, TOP_BOOKINGS_MOCK);

				return;
			}

			self.emit('getTopBookings', error, response, body);

		});

		return this;
	};

	/** @return */

	return BookingsService;

});