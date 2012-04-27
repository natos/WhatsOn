define([

], function() {

	var HOURS_PER_SLICE = 4, // Hours per slice must be: 1, 2, 3, 4, 6, 8, 12, 24.
		ESTIMATED_AVERAGE_EVENTS_PER_HOUR = 4,
		EVENTS_PER_SLICE = ESTIMATED_AVERAGE_EVENTS_PER_HOUR * HOURS_PER_SLICE,
		API_PREFIX = $('head').attr('data-api');

	var _eventsForChannelCache = {};

	/**
	 * Format a date as a string YYYY-MM-DDTHH:00Z
	 * Note that this ignores the minutes part of the date, and
	 * always places the formatted date at the top of the hour.
	 *
	 * @private
	 */
	var formatTimeForApiRequest = function(dt) {
		// TODO: take account of time zones?
		var formattedTime = dt.getFullYear().toString() + '-' + ('00' + (dt.getMonth() + 1).toString()).slice(-2) + '-' + ('00' + dt.getDate().toString()).slice(-2) + 'T' + ('00' + dt.getHours().toString()).slice(-2) + ':00' + 'Z';
		return formattedTime;
	}

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
		//   	00:00 - 04:00,
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
	}

	/**
	 * For each channel
	 * @private
	 */
	var getEventsForSlice = function(channelIds, timeSlice) {
		var formattedStartTime = formatTimeForApiRequest(timeSlice[0]);
		var formattedEndTime = formatTimeForApiRequest(timeSlice[1]);

		// Iterate over the channels list to see if we have an events collection
		// for this channel and time slice in cache. If not, add the channel to a list
		// of channels to fetch from the api.
		var channelIdsToFetchFromApi = [];
		var channelIdsToFetchFromCache = [];
		var channelIdsCount = channelIds.length;
		for (var i=0; i<channelIdsCount; i++) {
			var channelId = channelIds[i]; 
			var cacheKey = channelId + '|' + formattedStartTime + '|' + formattedEndTime;
			if (_eventsForChannelCache[cacheKey]) {
				channelIdsToFetchFromCache.push(channelId);
			} else {
				channelIdsToFetchFromApi.push(channelId);
			}
		}

		// Split channels to fetch into batches of 5
		var channelIdBatches = [];
		var batchSize = 5;
		var batchesCount = Math.ceil(channelIdsToFetchFromApi.length / batchSize);
		for (var i=0; i<batchesCount; i++) {
			channelIdBatches[i] = channelIdsToFetchFromApi.slice( batchSize * i, batchSize * (i+1) );
		}

		// Request each batch from the API
		var channelIdBatchesCount = channelIdBatches.length;
		for (var i=0; i<channelIdBatchesCount; i++) {
			var channelIdBatch = channelIdBatches[i]

			// &order=startDateTime
			// to get results in order
			var request = API_PREFIX + 'Channel/' + channelIdBatch.join('|') + '/events/NowAndNext_' + formattedStartTime + '.json?batchSize=' + EVENTS_PER_SLICE + '&order=startDateTime&callback=?'; 
			$.getJSON(request, function(apiResponse) {
				$(window).trigger('eventsReceived', [apiResponse]);
			});
		}

	}

	/**
	 * @public
	 */
	var getEventsForChannels = function(channelIds, startTime, endTime) {

		var timeSlices = getTimeSlices(startTime, endTime),
			slicesCount = timeSlices.length,
			i;

		for (i=0; i<slicesCount; i++) {
			getEventsForSlice(channelIds, timeSlices[i]);
		}
	}

	return {
		getEventsForChannels: getEventsForChannels
	}

});