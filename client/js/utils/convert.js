/*
* Convert Util
* ------------
*/

define([

	'config/grid'

], function Convert(g) {

/* private */

/* public */

	function timeToPixels(dateMilliseconds, limit) {
	
		limit = limit || g.zeroTime;
	
		var time = ( dateMilliseconds - limit.valueOf() ) / g.MILLISECONDS_IN_HOUR; // hours
		var pixels = Math.round(time * g.HOUR_WIDTH); // pixels
	
		return pixels;
	
	}

	/**
	* The EPG API returns dates (event.startDateTime, event.endDateTime)
	* in the format YYYY-MM-DDThh:mmZ. Safari before version 6 can't parse
	* a string in this format when constructing a new Date object.
	*/
	function parseApiDateStringAsMilliseconds(apiDate) {
		var ms;
		if (typeof(apiDate) === 'string') {
			ms = Date.UTC(apiDate.slice(0,4), parseInt(apiDate.slice(5,7),10) -1, parseInt(apiDate.slice(8,10),10), parseInt(apiDate.slice(11,13),10), parseInt(apiDate.slice(14,16),10));
		}
		return ms;
	}

/* export */

	return {
		timeToPixels	: timeToPixels,
		parseApiDateStringAsMilliseconds	: parseApiDateStringAsMilliseconds
	};

});