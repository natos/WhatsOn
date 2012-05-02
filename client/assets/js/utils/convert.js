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

		}

	};

	return Convert;

});