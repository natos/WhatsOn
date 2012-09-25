define([

	'modules/app'

], function(App) {

	'use strict';

	// constants
	var	API_PREFIX = $('head').attr('data-api'),
		CHANNEL_EVENTS_RECEIVED_EVENT = 'grid:eventsReceived';


	function getEventBatchFromAPI(channelsIds, timeSlice) {

		// I'm trying to trick the recursivity here...
		var start = timeSlice.start,
			end = timeSlice.end,
		// fix the request URL
			request = API_PREFIX 
		// get events for services
			+ '/linear/services/' + channelsIds + '/events.json'
		// properties
			+ '?show=start,end,service.id,programme.title'
		// filters
			// ATTENTION: notice that the date filters are inverted, this
			// is made like this to avoid losing events in between timeboxes.
			+ '&maxBatchSize=200&sort=start&start<=' + end + '&end>=' + start;

		// first request
			requestEvents(request);		
		
	}

	function requestEvents(url) {

//		console.log('requestEvents',url);

		$.getJSON(url + '&callback=?', function(response) {
			handleEventsFromAPI(response, url);
		});

	}

	function handleEventsFromAPI(response, url) {

		//console.log('processing', response);

		if (response) {

			App.emit(CHANNEL_EVENTS_RECEIVED_EVENT, response, url);
			
			if (response.nextBatchLink && response.nextBatchLink.href) {

				//console.log('EpgApi', 'Requesting next batch');
				// FIX
				// this URL re-write is necessary because
				// the API remembers the callback parameter
				// and this causes a mess with Zepto and the
				// AJAX callbacks
				var callbackName = /\&callback=jsonp\d+/gi;
				var nextUrl = response.nextBatchLink.href.replace(callbackName, '');
				// Ask for next Batch
				requestEvents(nextUrl);
			}

		}

	}

	return {
		getEventBatchFromAPI : getEventBatchFromAPI
	};

});