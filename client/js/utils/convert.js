/* 
* Convert Util
* ------------
*/

define([

	'config/grid'

], function Convert(g) {

/* private */

/* public */

	function timeToPixels(date, limit) {
	
		limit = limit || g.zeroTime;
	
		var time = ( date.valueOf() - limit.valueOf() ) / g.MILLISECONDS_IN_HOUR; // hours
		var pixels = Math.floor(time * g.HOUR_WIDTH); // pixels
	
		return pixels;
	
	}

	/**
	* The EPG API returns dates (event.startDateTime, event.endDateTime)
	* in the format YYYY-MM-DDThh:mmZ. Safari can't use this string as a
	* parameters for a new Date constructor.
	*/
	function parseApiDate(apiDate) {
		var dt;
		if (typeof(apiDate) === 'string') {
			dt = new Date(apiDate.slice(0,4), parseInt(apiDate.slice(5,7),10) -1, parseInt(apiDate.slice(8,10),10), parseInt(apiDate.slice(11,13),10), parseInt(apiDate.slice(14,16),10));
		}
		return dt;
	}

/* export */

	return {
		timeToPixels	: timeToPixels,
		parseApiDate	: parseApiDate
	};

});