/*
 * JavaScript Pretty Date (http://ejohn.org/files/pretty.js)
 * Copyright (c) 2011 John Resig (ejohn.org)
 * Licensed under the MIT and GPL licenses.
 * Modified by Natan Santolo.
 */

// Takes an ISO time and returns a string representing how
// long ago the date represents.
function prettyDate(time){
	var date = new Date((time || "").replace(/-/g,"/").replace(/[TZ]/g," ")),
		diff = (((new Date()).getTime() - date.getTime()) / 1000),
		day_diff = Math.floor(diff / 86400);
			
	if ( isNaN(day_diff) || /*day_diff < 0 ||*/ day_diff >= 31 )
		return;

	return day_diff == 0 && (
			diff < 60 && "just now" ||
			diff < 120 && "1 minute ago" ||
			diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
			diff < 7200 && "1 hour ago" ||
			diff < 86400 && Math.floor( diff / 3600 ) + " hours ago" ||
			// Added within minutes/hours
			diff > 60 && "menor a 60" ||
			diff > 120 && "within 1 min" ||
			diff > 3600 && "within " + Math.floor( diff / 60 ) + " minutes" ||
			diff > 7200 && "within 1 hour" ||
			diff > 86400 && "within " + Math.floor( diff / 3600 ) + " hours") ||
		day_diff == 1 && "yesterday" ||
		// Added tomorrow
		day_diff == -1 && "tomorrow" ||
		// Added within days
		day_diff < 7 && ( (day_diff < -1) ? "within " + (day_diff*-1) + " days" : day_diff + " days ago" ) ||
//		day_diff < 7 && day_diff + " days ago" ||
		day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago"
}

// If jQuery is included in the page, adds a jQuery plugin to handle it as well
if ( typeof jQuery != "undefined" )
	jQuery.fn.prettyDate = function(){
		return this.each(function(){
			var date = prettyDate(this.title);
			if ( date )
				jQuery(this).text( date );
		});
	};