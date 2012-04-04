/**
*	DateUtils
*/

define([

/**
*	@requires
*/

	// modules
	'i18n'

],


/**
*	@class DateUtils
*/

function(i18n) {

	/** @private */

	var __ = i18n.__;

	/** @constructor */

	var DateUtils = function() {

	};


	/** @public */
 
	/** 
	*	@method prettify
	*	@param Valid Date object
	*	@return String
	*/

	DateUtils.prototype.prettify = function(time) {
		/*
		* JavaScript Pretty Date (http://ejohn.org/files/pretty.js)
		* Copyright (c) 2011 John Resig (ejohn.org)
		* Licensed under the MIT and GPL licenses.
		* Modified by Natan Santolo.
		*/
		var date = new Date((time || "").replace(/-/g,"/").replace(/[TZ]/g," ")),
			diff = (((new Date()).getTime() - date.getTime()) / 1000),
			day_diff = Math.floor(diff / 86400);
			
		if ( isNaN(day_diff) || /*day_diff < 0 ||*/ day_diff >= 31 )
			return;

		return day_diff === 0 && (
				diff < 60 && __("just now") ||
				diff < 120 && __("1 minute ago") ||
				diff < 3600 && __("%s minutes ago", Math.floor( diff / 60 ) ) ||
				diff < 7200 && __("1 hour ago") ||
				diff < 86400 && __("%s hours ago", Math.floor( diff / 3600 ) ) ||
				// Added within minutes/hours
				diff > 60 && __("menor a 60") || // ???
				diff > 120 && __("within 1 min") ||
				diff > 3600 && __("within %s minutes", Math.floor( diff / 60 ) ) ||
				diff > 7200 && __("within 1 hour") ||
				diff > 86400 && __("within %s hours", Math.floor( diff / 3600 ) ) ) ||
			day_diff == 1 && __("yesterday") ||
			// Added tomorrow
			day_diff == -1 && __("tomorrow") ||
			// Added within days
			day_diff < 7 && ( (day_diff < -1) ? __("within %s days", (day_diff*-1) ) : __("%s days ago", day_diff ) ) ||
	//		day_diff < 7 && day_diff + " days ago" ||
			day_diff < 31 && __("%s weeks ago", Math.ceil( day_diff / 7 ) );
	};


	/** 
	*	@method prettifyCollection
	*	@param collection {array}
	*	@param property {string}
	*	@return collection
	*/

	DateUtils.prototype.prettifyCollection = function(collection, property) {

		var events = [], i = 0, t = collection.length;
		for (i; i < t; i++) {
			event = collection[i];
			collection[i].prettyDate = this.prettify( collection[i][property] );
			events.push( collection[i] );
		}
		return events;
	};


	/** @return */

	return DateUtils;

});