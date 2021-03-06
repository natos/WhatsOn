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
	'utils/cache',
	'utils/logger',

	// mock
	'mocks/topbookings'

],


/**
 *	@class BookingsService
 */

function(util, events, request, config, DateUtils, cache, logger, TOP_BOOKINGS_MOCK) {

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
					'imageUrl' : '' // We don't have images for top bookings
				},
				'channel' : {
					'id' : topBooking.channel.id,
					'name' : topBooking.channel.name
				}
			});
		}

		return normalizedEvents;
	};

	/**
	* Retrieve, normalize, and cache the Top Bookings feed.
	* Raise an event when complete.
	*/
	var populateTopBookingsCache = function(self) {

		// TODO: choose URL from config based on marketId
		var topBookingsUrl = 'http://tvgids.upc.nl/cgi-bin/WebObjects/EPGBooking.woa/wa/topBookings';

		request(topBookingsUrl, function(error, response, body) {

			// API Error? Grab the mock
			if ( !body || /404|500/.test(response.statusCode) ) {

				logger.error('Response code ' + response.statusCode + ' returned from Top Bookings URL: ' + topBookingsUrl);
				self.emit('getTopBookings', []);

			} else {

				var topBookings = [];
				try {
					topBookings = JSON.parse(body);
					topBookings = normalizeTopBookings(topBookings);
					cache.set('top-bookings', topBookings, 900); // Cache for 15 minutes
				} catch(e) {
					// Error - do not update cache
					topBookings = [];
				}

				self.emit('getTopBookings', topBookings);

			}


		});


	};


	/** @public */

	/** Get list of top bookings */
	BookingsService.prototype.getTopBookings = function(id) {

		var self = this;

		// Use cached Top Bookings for up to 15 minutes
		var topBookings = cache.get('top-bookings');
		if (topBookings) {
			self.emit('getTopBookings', topBookings);
		} else {
			populateTopBookingsCache(self);
		}

		return this;
	};

	/** @return */

	return BookingsService;

});