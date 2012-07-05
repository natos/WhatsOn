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

	/**
	* Format a date as a string YYYY-MM-DDTHH:00Z
	* Note that this ignores the minutes part of the date, and
	* always places the formatted date at the top of the hour.
	*
	* @private
	* @return  {string} YYYY-MM-DDTHH:00Z
	*/
	var formatTimeForApiRequest = function(dt) {
		// TODO: take account of time zones?
		var formattedTime = dt.getFullYear().toString() + '-' + ('00' + (dt.getMonth() + 1).toString()).slice(-2) + '-' + ('00' + dt.getDate().toString()).slice(-2) + 'T' + ('00' + dt.getHours().toString()).slice(-2) + ':00' + 'Z';
		return formattedTime;
	};

	var getCacheKey = function(channelGroup, timeSlice) {

		var formattedStartTime = formatTimeForApiRequest(timeSlice[0]),
			formattedEndTime = formatTimeForApiRequest(timeSlice[1]);

		return channelGroup + '|' + formattedStartTime + '|' + formattedEndTime;
	};

	/**
	* Given a start date time and end date time, return an array of time slices
	* that is sufficient to cover the entire time span.
	*
	* @private
	* @return  Array of time slices: [[slice1StartTime, slice1EndTime], [slice2StartTime, slice2EndTime], ...]
	*/
	var getTimeSlices = function(startDate, endDate) {
		// Time slices: each slice is HOURS_PER_SLICE hours wide.
		// If HOURS_PER_SLICE = 4, then the slices are:
		// [
		//		00:00 - 04:00,
		//		04:00 - 08:00,
		//		08:00 - 12:00,
		//		...
		// ]

		// Adjust the start and end dates, so that the align with slice boundaries
		startDate.setMinutes(0);
		startDate.setSeconds(0);
		startDate.setMilliseconds(0);
		var startSliceIndex = Math.floor(startDate.getHours() / HOURS_PER_SLICE);
		startDate.setHours(startSliceIndex * HOURS_PER_SLICE);

		endDate.setMinutes(0);
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
	var getEventsForSliceFromApi = function(channelIds, timeSlice, eventsPerSlice) {
		// Split channels to fetch into batches of 5. The API only handles max 5 channels at once.
		var channelIdBatches = [],
			batchSize = 5,
			batchesCount = Math.ceil(channelIds.length / batchSize),
			i,
			formattedStartTime = formatTimeForApiRequest(timeSlice[0]),
			formattedEndTime = formatTimeForApiRequest(timeSlice[1]),
			channelIdBatchesCount,
			channelIdBatch,
			// for recursive calling more events;
			eventsPerSlice = eventsPerSlice || EVENTS_PER_SLICE,
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
			request = API_PREFIX + 'Channel/' + channelIdBatch.join('|') + '/events.json?qualifier=endDateTime%3E=@{timestamp%20' + formattedStartTime + '}%20and%20startDateTime%3C@{timestamp%20' + formattedEndTime + '}' + '&order=startDateTime&optionalProperties=Programme.subcategory&callback=?';

			//request = API_PREFIX + 'Channel/' + channelIdBatch.join('|') + '/events/NowAndNext_' + formattedStartTime + '.json?batchSize=' + eventsPerSlice + '&order=startDateTime&optionalProperties=Programme.subcategory&callback=?'; 
			// TODO: Don't create functions inside a loop! (JSHint)
			$.getJSON(request, function(apiResponse) {
				handleApiResponse_EventsForSliceFromApi(apiResponse, timeSlice, eventsPerSlice, timer);
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

	var handleApiResponse_EventsForSliceFromApi = function(apiResponse, timeSlice, eventsPerSlice, timer) {

/* for performance tests */
timer.track('API Response');
// Average time to test Jedrzej API performance
average(timer.timeDiff);
/* for performance tests */

		var eventsForChannelCollection = [],
			cacheKey,
			channelId,
			lastEventEndDate;/*,
			repeatChannelIds = [];*/

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

			// Check if the API has returned enough events for us to "fill up"
			// the cache for this channel's time slice
			/*lastEventEndDate = convert.parseApiDate(eventsForChannel[eventsForChannel.length - 1].endDateTime);
			channelId = eventsForChannel[0].channel.id;
			if (lastEventEndDate > timeSlice[1]) {
				// Cache the event collection by channel ID and timeslice index
				cacheKey = getCacheKey(channelId, timeSlice);

				// this loop we don't need it
				//eventsToBeCached = [];
				for(var i=eventsForChannel.length - 1; i>=0; i--) {
					// Only cache events in this slice that actually *belong* in the current slice.
					// Note (MS 22/6/2012): Once we have Jędrzej's new API that guarantees to
					// return only the events in a slice, we won't need this check any more.
					if (convert.parseApiDate(eventsForChannel[i].startDateTime).valueOf() >= timeSlice[1].valueOf() ) {
						eventsForChannel.pop();
					}
				}

				$CUSTOM_EVENT_ROOT.emit(CHANNEL_EVENTS_RECEIVED_EVENT, eventsForChannel, cacheKey);
			} else {
				// Not enough events for this channel and time slice.
				// Add the channel to the repeatChannelIds array
				repeatChannelIds.push(channelId);
			}*/

		});

		// Re-request channels that were not fully populated
		/*if (repeatChannelIds.length>0) {
			getEventsForSliceFromApi(repeatChannelIds, timeSlice, 2*eventsPerSlice);
		}*/

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

	var getCacheKey = function(channelId, timeSlice) {
		return channelId + '|' + timeSlice[0].valueOf() + '|' + timeSlice[1].valueOf();
	};

	return {

		getEventsForChannels		: getEventsForChannels,
		getEventsForSliceFromApi	: getEventsForSliceFromApi,
//		searchForEvents				: searchForEvents,
		getTimeSlices 				: getTimeSlices,
		formatTimeForApiRequest 	: formatTimeForApiRequest,
		getCacheKey					: getCacheKey
	};

});