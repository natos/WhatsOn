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

	// utils
	'utils/dateutils',

	// mock
	'mocks/topbookings'

],


/**
 *	@class BookingsService
 */

function(util, events, request, config, DateUtils, TOP_BOOKINGS_MOCK) {

	/** @constructor */

	var BookingsService = function() {

		/** @borrow EventEmitter.constructor */ 
		events.EventEmitter.call(this);

		return this;

	};

	/** @inherits EventEmitter */
	util.inherits(BookingsService, events.EventEmitter);


	/** @private */

	var _dateUtils = new DateUtils();

	var TOP_BOOKINGS = 'http://tvgids.upc.nl/cgi-bin/WebObjects/EPGBooking.woa/wa/topBookings';

	var TOP_BOOKINGS_MOCK = JSON.stringify(TOP_BOOKINGS_MOCK); // emulating a text response

	/**
	 * Turn the JS object from the top bookings feed into a 
	 * flattened, normalized array of events.
	 */
	var normalizeTopBookings = function(topBookings) {

		var normalizedEvents = [];
		var topBookingsCount = topBookings.length;
		var i, j, topBooking;

		for (i=0; i<topBookingsCount; i++) {
			topBooking = topBookings[i][0];

			normalizedEvents.push({
				'id' : topBooking.id,
				'startDateTime' : topBooking.startDateTime,
				'endDateTime' : topBooking.endDateTime,
				'prettyStartTime' : _dateUtils.prettify(topBooking.startDateTime),
				'programme' : {
					'title' : topBooking.programme.title,
					'id' : topBooking.programme.id,
					'shortDescription' : topBooking.programme.shortDescription,
					'descriptionHtml' : '',
					'imageUrl' : config['FEATURED_PROGRAMMES_IMAGE_BASE_URL'] + '/s/' + topBooking.programme.id + '.jpg'
				},
				'channel' : {
					'id' : topBooking.channel.id,
					'name' : topBooking.channel.name
				}
			});
		}

		return normalizedEvents;
	};


	/** @public */

	/** Get list of top bookings */
	BookingsService.prototype.getTopBookings = function(id) {

		var self = this;

		request(TOP_BOOKINGS, function(error, response, body) {

			// API Error? Grab the mock
			if ( !body || /404|500/.test(response.statusCode) ) {

				self.emit('getTopBookings', normalizeTopBookings(TOP_BOOKINGS_MOCK));

			} else {

				var topBookings = JSON.parse(body);

				self.emit('getTopBookings', normalizeTopBookings(topBookings));

			}


		});

		return this;
	};

	/** @return */

	return BookingsService;

});