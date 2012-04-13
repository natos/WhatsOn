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

	var DateUtils = function(date) {

		var _now;

		return this;

	};


	/** @public */

	/** 
	*	Set or get the now
	*	@method new
	*	@param [Date]
	*/

	DateUtils.prototype.now = function(date) {

		if (!date) {

			return this._now || new Date();

		}

		this._now = new Date(date);

		return this;

	};
 
	/** 
	*	@method prettify
	*	@param Date
	*	@return String
	*/

	DateUtils.prototype.prettify = function(time) {

		/*
		* This code is based on John's JavaScript Pretty Date (http://ejohn.org/files/pretty.js)
		*/

		var date = new Date( (time || "").replace(/-/g,"/").replace(/[TZ]/g," ") ),
			now = new Date( this.now().toJSON().replace(/-/g,"/").replace(/[TZ]/g," ") ),
			diff = (( now.getTime() - date.getTime() ) / 1000),
			day_diff = Math.round(diff / 86400),
			days = Math.abs(day_diff);

			// TODO: Error handling
			if ( isNaN(day_diff) ) { return; }

		// Within a day
		return day_diff === 0 && (
			diff < 0 && (
				diff > -120 && __("within 1 minute") ||
				diff > -3600 && __("within %s minutes", Math.floor( (diff*-1) / 60 ) ) ||
				diff > -7200 && __("within 1 hour") ||
				diff > -86400 && __("within %s hours", Math.floor( (diff*-1) / 3600 ) ) 
			) ||

			diff >= 0 && (
				diff < 60 && __("just now") ||
				diff < 120 && __("1 minute ago") ||
				diff < 3600 && __("%s minutes ago", Math.floor( diff / 60 ) ) ||
				diff < 7200 && __("1 hour ago") ||
				diff < 86400 && __("%s hours ago", Math.floor( diff / 3600 ) ) 
			) 
		) ||

		// Future
		day_diff < 0 && (

			// Days
			days < 7 && (
				day_diff === -1 && __("tomorrow") ||
				day_diff > -7 && __("within %s days", days) 
			) ||

			// Weeks
			day_diff === -7 && __("within a week", days) || __("within %s weeks", Math.floor( days / 7 )) 

		) ||

		// Past
		day_diff > 0 && (

			// Days
			days < 7 && (
				day_diff === 1 && __("yesterday") ||
				day_diff < 7 && __("%s days ago", days) 
			) ||

			// Weeks
			day_diff === 7 && __("a week ago", days) || __("%s weeks ago", Math.floor( days / 7 )) 
		);
	};


	/** 
	*	DEPRECATED
	*	@method prettifyCollection
	*	@param collection {array}
	*	@param property {string}
	*	@return collection
	*
	*	TODO: use map function
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