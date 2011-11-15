
define([
	// Dependencies
], 

function(){

	//var source = 'http://tvgids.upc.nl/customerApi/wa/topBookings';
	var source = './mock.txt';

	return {
		
		getData: function() {
			return $.getJSON(source);
		}

	}


});