
define([
	// Dependencies
], 

function(){

	var source = 'http://tvgids.upc.nl/cgi-bin/WebObjects/EPGApi.woa/api/Channel.json';

	return {
		
		getData: function() {
			return $.getJSON(source + '?callback=?' );
		}

	}


});