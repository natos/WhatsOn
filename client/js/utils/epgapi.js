define([

	'config/app',
	'config/grid',
	'modules/event'

], function(a, g, Event) {

	'use strict';

	// constants
	var	API_PREFIX = $('head').attr('data-api'),

		MAX_BATCH_SIZE = 128;


	function getCountriesFromAPI() {

		// fix the request URL
		var request = API_PREFIX
		// get events for services
			+ '/countries.json'
		// properties
			+ '?show=name,schedules.selfLink,linearLineupLink'
		// filters
			+ '&sort=provinces.code';

		// first request
			query(request, a.COUTRIES_RECEIVED);

	}

	function getSchedulesFromAPI(request) {

		// fix the request URL
		var request = request
		// properties
			+ '?show=categories.name,genres.name';

		// first request
			query(request, a.SCHEDULES_RECEIVED);

	}

	function getLineUpFromAPI(request) {

		// fix the request URL
		var request = request
		// properties
			+ '?show=name,logicalPosition,eventsLink,channel,logoLink,genres.name'
		// filters
			+ '&sort=logicalPosition';

		// first request
			query(request, a.LINEUP_RECEIVED);

	}

	function getCategoriesFromAPI(request) {

		// fix the request URL
		//var request = request
		// properties
		//	+ '?show=name'
		// filters
		//	+ '&sort=name';

		// first request
			query(request, a.CATEGORIES_RECEIVED);

	}

	function getGenresFromAPI(request) {
		// fix the request URL
		//var request = request
		// properties
		//	+ '?show=name'
		// filters
		//	+ '&sort=name';

		// first request
			query(request, a.GENRES_RECIEVED);
	}

	function getEventFromAPI(id) {

		// fix the request URL
		var request = API_PREFIX 
		// get events for services
			+ '/programmes/' + id + '.json'
		// properties
			+ '?show=title,shortDescription,episodeTitle,episodeNumber,events.start,series.episodes.episodeTitle,series.episodes.events,series.episodes.events.programme.id'
		// filters
			+ '&sort=events.start';

		// first request
			query(request, g.EVENT_RECEIVED);

	}

	function getEventBatchFromAPI(channelsIds, timeSlice) {

		// fix the request URL
		var request = API_PREFIX 
		// get events for services
			+ '/linearServices/' + channelsIds + '/events.json'
		// properties
			+ '?show=start,end,service.id,programme.id,programme.title,programme.subcategory.name,programme.subcategory.category.name'
		// filters
			// ATTENTION: notice that the date filters are inverted, this
			// is made like this to avoid losing events in between timeboxes.
			+ '&sort=start&start<=' + timeSlice.end + '&end>=' + timeSlice.start;

		// first request
			query(request, g.EVENTS_RECEIVED);
		
	}

	function query(url, eventName) {

		$.getJSON(url + '&maxBatchSize=' + MAX_BATCH_SIZE + '&callback=?', function(response) {
			handleResponse(response, url, eventName);
		});

	}

	function handleResponse(response, url, eventName) {

		if (response) {

			Event.emit(eventName, response, url);
			
			if (response.nextBatchLink && response.nextBatchLink.href) {
				// FIX
				// this URL re-write is necessary because
				// the API remembers the callback parameter
				// and this causes a mess with Zepto/jQuery
				// and the AJAX callbacks
				var callbackName = /\&callback=jsonp\d+/gi;
				var nextUrl = response.nextBatchLink.href.replace(callbackName, '');
				// Ask for next Batch
				query(nextUrl, eventName);
			}

		}

	}

	return {
		getEventBatchFromAPI 	: getEventBatchFromAPI,
		getCategoriesFromAPI	: getCategoriesFromAPI,
		getCountriesFromAPI		: getCountriesFromAPI,
		getSchedulesFromAPI		: getSchedulesFromAPI,
		getGenresFromAPI		: getGenresFromAPI,
		getLineUpFromAPI 		: getLineUpFromAPI,
		getEventFromAPI 		: getEventFromAPI,
		query 					: query
	};

});