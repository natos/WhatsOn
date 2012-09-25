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

	/**
	* Format a date as a string YYYY-MM-DDTHH:00Z
	* Note that this ignores the minutes part of the date, and
	* always places the formatted date at the top of the hour.
	*
	* @private
	* @return  {string} YYYY-MM-DDTHH:00Z
	*/
	function formatTimeForApiRequest(date) {
		var dt = new Date(date);
		var formattedTime = dt.getUTCFullYear().toString() + '-' + ('00' + (dt.getUTCMonth() + 1).toString()).slice(-2) + '-' + ('00' + dt.getUTCDate().toString()).slice(-2) + 'T' + ('00' + dt.getUTCHours().toString()).slice(-2) + ':00' + 'Z';
		return formattedTime;
	};

/* export */

	return {
		timeToPixels						: timeToPixels,
		formatTimeForApiRequest				: formatTimeForApiRequest,
		parseApiDateStringAsMilliseconds 	: parseApiDateStringAsMilliseconds
	};

});