define([

	'config/grid'

], function(g) {

/* private */

/* Converter */

	var Convert = {

		initialize: function() {

		},

		timeToPixels: function(date, limit) {

			limit = limit || g.ZERO;

			var time = ( date.valueOf() - limit.valueOf() ) / g.MILLISECONDS_IN_HOUR; // hours
			var pixels = Math.floor(time * g.HOUR_WIDTH); // pixels

			return pixels;

		},

		/**
		 * The EPG API returns dates (event.startDateTime, event.endDateTime)
		 * in the format YYYY-MM-DDThh:mmZ. Safari can't use this string as a
		 * parameters for a new Date constructor.
		 */
		parseApiDate: function(apiDate) {
			var dt;
			if (typeof(apiDate) === 'string') {
				dt = new Date(apiDate.slice(0,4), parseInt(apiDate.slice(5,7),10) -1, parseInt(apiDate.slice(8,10),10), parseInt(apiDate.slice(11,13),10), parseInt(apiDate.slice(14,16),10));
			}
			return dt;
		}

	};

	return Convert;

});