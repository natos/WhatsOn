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
	var	HOURS_PER_SLICE = 4, // Hours per slice must be: 1, 2, 3, 4, 6, 8, 12, 24.
		ESTIMATED_AVERAGE_EVENTS_PER_HOUR = 2,
		EVENTS_PER_SLICE = ESTIMATED_AVERAGE_EVENTS_PER_HOUR * HOURS_PER_SLICE,
		API_PREFIX = $('head').attr('data-api'),
		$CUSTOM_EVENT_ROOT = App,
		CHANNEL_EVENTS_RECEIVED_EVENT = 'grid:eventsReceived',
		SEARCH_RESULTS_RECEIVED_EVENT = 'searchResultsReceived',
		CACHE_DURATION = 60 * 24; // 1 day


	function getEventsFromAPI(channelsIds, startTime, endTime) {
		// I'm trying to trick the recursivity here...
		var start = formatTimeForApiRequest(startTime),
			end = formatTimeForApiRequest(endTime),
			collection = [],
		// fix the request URL
			request = API_PREFIX 
		// get events for services
			+ '/linear/services/' + channelsIds.join(',') + '/events.json'
		// properties
			+ '?show=start,end,service.id,programme.title'
		// filters
			+ '&maxBatchSize=200&sort=start&start>=' + start + '&end<=' + end;

		// first request
			requestEvents(request);		
		
	}

	function requestEvents(url) {

		//console.log('requestEvents',url);

		$.getJSON(url + '&callback=?', handleEventsFromAPI);

	}

	function handleEventsFromAPI(response) {

		//console.log('processing', response);

		if (response) {

			$CUSTOM_EVENT_ROOT.emit(CHANNEL_EVENTS_RECEIVED_EVENT, response);
			
			if (response.nextBatchLink && response.nextBatchLink.href) {

				//console.log('EpgApi', 'Requesting next batch');
				// FIX
				// this URL re-write is necessary because
				// the API remembers the callback parameter
				// and this causes a mess with Zepto and the
				// AJAX callbacks
				var callbackName = /\&callback=jsonp\d/gi;
				var url = response.nextBatchLink.href.replace(callbackName, '');

				// Ask for next Batch
				requestEvents(url);
			}

		}

	}

	/**
	* Format a date as a string YYYY-MM-DDTHH:00Z
	* Note that this ignores the minutes part of the date, and
	* always places the formatted date at the top of the hour.
	*
	* @private
	* @return  {string} YYYY-MM-DDTHH:00Z
	*/
	var formatTimeForApiRequest = function(date) {
		var dt = new Date(date);
		var formattedTime = dt.getUTCFullYear().toString() + '-' + ('00' + (dt.getUTCMonth() + 1).toString()).slice(-2) + '-' + ('00' + dt.getUTCDate().toString()).slice(-2) + 'T' + ('00' + dt.getUTCHours().toString()).slice(-2) + ':00' + 'Z';
		return formattedTime;
	};

	/**
	* Given a start date time and end date time, return an array of time slices
	* that is sufficient to cover the entire time span.
	*
	* @private
	* @return  Array of time slices: [[slice1StartTime, slice1EndTime], [slice2StartTime, slice2EndTime], ...]
	*/
	var getTimeSlices = function(paramStartDate, paramEndDate) {
		// Time slices: each slice is HOURS_PER_SLICE hours wide.
		// If HOURS_PER_SLICE = 4, then the slices are:
		// [
		//		00:00 - 04:00,
		//		04:00 - 08:00,
		//		08:00 - 12:00,
		//		...
		// ]

		// Take copies of the startDate and endDate input so we don't modify the original
		// input values by reference:
		var startDate = new Date(paramStartDate.valueOf());
		var endDate = new Date(paramEndDate.valueOf());

		// Adjust the start and end dates, so that they align with slice boundaries.

		// Round the start date DOWN to the last whole hour
		startDate.setMinutes(0);
		startDate.setSeconds(0);
		startDate.setMilliseconds(0);
		var startSliceIndex = Math.floor(startDate.getHours() / HOURS_PER_SLICE);
		startDate.setHours(startSliceIndex * HOURS_PER_SLICE);

		// Round the end time UP to the next whole hour
		endDate.setMinutes(60);
		endDate.setSeconds(0);
		endDate.setMilliseconds(0);
		var endSliceIndex = Math.ceil(endDate.getHours() / HOURS_PER_SLICE);
		endDate.setHours(endSliceIndex * HOURS_PER_SLICE);

		var timeSlices = [];
		var millisecondsPerSlice = HOURS_PER_SLICE * 60 * 60 * 1000;
		var sliceStart = new Date(startDate.valueOf());
		var sliceEnd = new Date(startDate.valueOf() + millisecondsPerSlice);
		do {
			timeSlices.push([new Date(sliceStart.valueOf()), new Date(sliceEnd.valueOf())]);
			sliceStart = new Date(sliceStart.valueOf() + millisecondsPerSlice);
			sliceEnd = new Date(sliceEnd.valueOf() + millisecondsPerSlice);
		} while (sliceEnd <= endDate);

		return timeSlices;
	};

	/**
	* @private
	* @async
	* @return void
	*/
	var getEventsForSliceFromApi = function(channelIds, timeSlice) {
		// Split channels to fetch into batches of 5. The API only handles max 5 channels at once.
		var channelIdBatches = [],
			batchSize = 5,
			batchesCount = Math.ceil(channelIds.length / batchSize),
			i,
			formattedStartTime = formatTimeForApiRequest(timeSlice[0]),
			formattedEndTime = formatTimeForApiRequest(timeSlice[1]),
			channelIdBatchesCount,
			channelIdBatch,
			request;

		for (i = 0; i < batchesCount; i++) {
			channelIdBatches[i] = channelIds.slice( batchSize * i, batchSize * (i+1) );
		}

		// Request each batch from the API
		channelIdBatchesCount = channelIdBatches.length;
		for (i=0; i<channelIdBatchesCount; i++) {
			channelIdBatch = channelIdBatches[i];

/* for performance tests */
var timer = new Timer('getEventsForSliceFromApi Time Track').off();
/* for performance tests */

			// Use "&order=startDateTime" to get results in order
			// Use "&optionalProperties=Programme.subcategory" to get category data
			//request = API_PREFIX + 'Channel/' + channelIdBatch.join('|') + '/events.json?qualifier=endDateTime%3E=@{timestamp%20' + formattedStartTime + '}%20and%20startDateTime%3C@{timestamp%20' + formattedEndTime + '}' + '&order=startDateTime&optionalProperties=Programme.subcategory&callback=?';
			request = API_PREFIX + '/linear/services/' + channelIdBatch.join(',') + '/events.json?show=start,end,service.selfLink,programme.selfLink,selfLink&maxBatchSize=4&sort=start&start%3E2012-09-13T09:00Z&end%3E2012-09-13T11:00Z&callback=?';

			// TODO: Don't create functions inside a loop! (JSHint)
			$.getJSON(request, function(apiResponse) {
				handleApiResponse_EventsForSliceFromApi(apiResponse, timeSlice, timer);
			});
		}
	};

	/**
	* Process API responses from the calls initiated in getEventsForSliceFromApi.
	* Cache the responses, and raise messages.
	*
	* @private
	* @async
	* @return void
	*/

	var handleApiResponse_EventsForSliceFromApi = function(apiResponse, timeSlice, timer) {

/* for performance tests */
timer.track('API Response');
// Average time to test Jedrzej API performance
average(timer.timeDiff);
/* for performance tests */

		var eventsForChannelCollection = [],
			cacheKey,
			channelId;

		if ($.isArray(apiResponse) && apiResponse.length > 0 && $.isArray(apiResponse[0])) {
			// response is an array of channels; each channel contains an array of events
			$.each(apiResponse, function(ix, eventsForChannel) {
				eventsForChannelCollection.push(eventsForChannel);
			});
		} else {
			// response is an array of events for a single channel
			eventsForChannelCollection[0] = apiResponse;
		}

		$.each(eventsForChannelCollection, function(ix, eventsForChannel) {
			if (!eventsForChannel.length ) {
				console.log("Warning: eventsForChannel is an empty array");
				console.log(apiResponse);
				return;
			}

			channelId = eventsForChannel[0].channel.id;
			cacheKey = getCacheKey(channelId, timeSlice);

			// > Emit the event here !!!
			$CUSTOM_EVENT_ROOT.emit(CHANNEL_EVENTS_RECEIVED_EVENT, eventsForChannel, cacheKey);
		});

		// GC Friendly ;)
		// We are inside a closure, so all the data inside here
		// will remain until the garbage collector cleans it
		apiResponse = null;

	};


	/**
	* Retrieve events for the specified channel IDs and time range.
	* This function does not return the events immediately. Instead,
	* it will try to retrieve the events from cache or from the API.
	* Whenever results become available, an "eventsReceived" message will
	* be raised.
	*
	* Usage:

		// Start listening for eventsReceived event
		$CUSTOM_EVENT_ROOT.bind('eventsReceived', function(e, data){
			console.log(data);
		});

		var channelIds = ['7s','7l','6s'];
		var startTime = new Date();
		var endTime = new Date(startTime.valueOf() + (4 * 60 * 60 * 1000));
		EpgApi.getEventsForChannels(channelIds, startTime, endTime);
	*
	* @public
	* @async
	* @return void
	* @deprecated
	*/
	var getEventsForChannels = function(channelIds, startTime, endTime) {

		var timeSlices = getTimeSlices(startTime, endTime),
			slicesCount = timeSlices.length,
			i;

			console.log(startTime, endTime);

		for (i=0; i<slicesCount; i++) {
			getEventsForSliceFromApi(channelIds, timeSlices[i]);
		}
	};

	/**
	* Perform an EPG search for events. Raises an "searchResultsReceived"
	* message when the eventsd have been returned.
	*
	* Usage:

		// Start listening for searchResultsReceived event
		$CUSTOM_EVENT_ROOT.bind('searchResultsReceived', function(e, data){
			console.log(data);
		});

		EpgApi.searchForEvents('monkeys');
	*
	* @public
	* @async
	* @return void
	*/
	var searchForEvents = function(q) {
		// Use "&order=startDateTime" to get results in order
		var request = API_PREFIX + 'Event.json?query=' + escape(q) + '&callback=?';
		$.getJSON(request, function(apiResponse) {
			$CUSTOM_EVENT_ROOT.emit(SEARCH_RESULTS_RECEIVED_EVENT, [apiResponse]);
		});
	};

	var getCacheKey = function(channelId, start, end) {
		//return channelId + '|' + new Date(start).valueOf() + '|' + new Date(end).valueOf();
		return channelId + '|' + new Date(start).getUTCHours().toString();
	};

	return {
		getEventsFromAPI 			: getEventsFromAPI, // new API
		getEventsForChannels		: getEventsForChannels,
		getEventsForSliceFromApi	: getEventsForSliceFromApi,
//		searchForEvents				: searchForEvents,
		getTimeSlices 				: getTimeSlices,
		formatTimeForApiRequest 	: formatTimeForApiRequest,
		getCacheKey					: getCacheKey
	};

});