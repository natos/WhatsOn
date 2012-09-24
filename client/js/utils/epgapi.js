define([

	'modules/app',
	'utils/convert',
	'/js/lib/timetrack/timetrack.js'

], function(App, convert) {

	'use strict';

/*
* Average time tool
*/
	//startShowingAverageTime();

	var average_tilnow = 0,
		average_time = 0,
		average_count = 0,
		last_average = 0;

	function startShowingAverageTime() {
		setTimeout(showAverageTime,1000);
	}

	function showAverageTime() {

		setTimeout(showAverageTime,1000);

		if (average_tilnow !== 0 && average_tilnow !== last_average) {
			console.log('Average time <', average_tilnow, 'ms>');
			last_average = average_tilnow;
		}

	}

	function average(time) {
		average_time += time; average_count += 1;
		average_tilnow = Math.ceil(average_time / average_count);
	}

	// constants
	var	HOURS_PER_SLICE = 6, // Hours per slice must be: 1, 2, 3, 4, 6, 8, 12, 24.
		ESTIMATED_AVERAGE_EVENTS_PER_HOUR = 2,
		EVENTS_PER_SLICE = ESTIMATED_AVERAGE_EVENTS_PER_HOUR * HOURS_PER_SLICE,
		API_PREFIX = $('head').attr('data-api'),
		$CUSTOM_EVENT_ROOT = App,
		CHANNEL_EVENTS_RECEIVED_EVENT = 'grid:eventsReceived',
		SEARCH_RESULTS_RECEIVED_EVENT = 'searchResultsReceived',
		CACHE_DURATION = 60 * 24; // 1 day


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

			$CUSTOM_EVENT_ROOT.emit(CHANNEL_EVENTS_RECEIVED_EVENT, response, url);
			
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