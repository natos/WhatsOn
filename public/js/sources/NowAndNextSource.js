
define([
	// Dependencies
], 

function(){

	var source = 'http://tvgids.upc.nl/scheduleApi/api/Channel/7J%7C6s%7C7G%7C7K%7C7L/events/NowAndNext.json?optionalProperties=Channel.url%2CChannel.logoIMG%2CEvent.url&order=startDateTime&batchSize=2&batch=0';

	return {
		
		getData: function() {
			return $.getJSON(source + '&callback=?' );
		}

	}


});