/** GridSource
* Data source for Events in the grid
*/
define([
	// Dependencies
	'js/libs/timer/timer.js'
], 

function() {

	var sourceTimer;

	var HOURS_PER_SLICE = 4;

	var getSliceStartTimeFromSliceIndex = function(zeroTime, sliceIndex) {
		var sliceStartTime = new Date(zeroTime.getFullYear(), zeroTime.getMonth(), zeroTime.getDate(), sliceIndex * HOURS_PER_SLICE, 0, 0);
		return sliceStartTime;
	}

	var formatTimeForApiRequest = function(dt) {
		// TODO: take account of time zones?
		var formattedTime = dt.getFullYear().toString() + '-' + ('00' + (dt.getMonth() + 1).toString()).slice(-2) + '-' + ('00' + dt.getDate().toString()).slice(-2) + 'T' + ('00' + dt.getHours().toString()).slice(-2) + ':00' + 'Z';
		return formattedTime;
	}

	var getSliceIndexFromTime = function(zeroTime, targetTime) {
		// Time slices: each slice is HOURS_PER_SLICE hours wide.
		// If HOURS_PER_SLICE = 4, then the slices are:
		// [
		//   	today 00:00 - 04:00,
		//		today 04:00 - 08:00,
		//		today 08:00 - 12:00,
		//		...
		//		today + 2 16:00 - 20:00,
		//		today + 2 20:00 - 24:00
		// ]

		var todayOrigin = new Date(zeroTime.getFullYear(), zeroTime.getMonth(), zeroTime.getDate());
		var millisecondsToTodayOrigin = targetTime.valueOf() - todayOrigin.valueOf();
		var hoursToTodayOrigin = millisecondsToTodayOrigin / (1000 * 60 * 60);
		var sliceIndex = Math.floor(hoursToTodayOrigin / HOURS_PER_SLICE);
		return sliceIndex;
	}

	var eventCollectionsCache = {};

	var getEventsForSliceIndex = function(sliceIndex, channelIds, zeroTime, eventsCollectionRendererCallback, gridView) {
		// Iterate over the channels list to see if we have an events collection
		// for this channel and time slice in cache. If not, add the channel to a list
		// of channels to fetch from the api.
		var channelIdsToFetch = []
		var channelIdsCount = channelIds.length;
		for (var i=0; i<channelIdsCount; i++) {
			var cacheKey = channelIds[i] + '|' + sliceIndex;
			var eventsCollection = eventCollectionsCache[cacheKey];
			if (eventsCollection) {
				// render the events collection from cache
//				console.log('Retrieved events for channel ' + channelIds[i] + ', slice ' + sliceIndex + ' from cache');
				eventsCollectionRendererCallback.call(gridView, eventsCollection);
			} else {
				// This channel should be fetched remotely.
				channelIdsToFetch.push(channelIds[i]);
			}
		}

		// Split channels to fetch into batches of 5
		var channelIdBatches = [];
		var batchSize = 5;
		var batchesCount = Math.ceil(channelIdsToFetch.length / batchSize);
		for (var i=0; i<batchesCount; i++) {
			channelIdBatches[i] = channelIdsToFetch.slice( batchSize * i, batchSize * (i+1) );
		}

		// Request each batch from the API
		var channelIdBatchesCount = channelIdBatches.length;
		for (var i=0; i<channelIdBatchesCount; i++) {
			var channelIdBatch = channelIdBatches[i]

			var sliceStartTime = getSliceStartTimeFromSliceIndex(zeroTime, sliceIndex);
			var formattedSliceStartTime = formatTimeForApiRequest(sliceStartTime);
//			var request = 'http://tvgids.upc.nl/cgi-bin/WebObjects/EPGApi.woa/api/Channel/' + channelIdBatch.join('|') + '/events/NowAndNext_' + formattedSliceStartTime + '.json?batchSize=10&callback=?';

			// &order=startDateTime
			// to get results in order
			var request = API_PREFIX + 'Channel/' + channelIdBatch.join('|') + '/events/NowAndNext_' + formattedSliceStartTime + '.json?batchSize=10&order=startDateTime&callback=?'; 

			sourceTimer = new Timer('API Call Timer')

			$.getJSON(request, function(apiResponse) {
				processApiResponse(apiResponse, sliceIndex, eventsCollectionRendererCallback, gridView);
			});
		}
	}

	var processApiResponse = function(apiResponse, sliceIndex, eventsCollectionRendererCallback, gridView) {

		sourceTimer.track('API Call Response');

		var eventsCollections = [];
		if (_.isArray(apiResponse) && apiResponse.length > 0 && _.isArray(apiResponse[0])) {
			// response is an array of channels; each channel contains an array of events
			_.each(apiResponse, function(eventsCollection) {
				eventsCollections.push(eventsCollection);
			});
		} else {
			// response is an array of events for a single channel
			eventsCollections[0] = apiResponse;
		}

		_.each(eventsCollections, function(eventsCollection) {
			if (!eventsCollection.length ) {
				console.log("Warning: eventCollection is an empty array");
				console.log(apiResponse);
				return;
			}

			eventsCollectionRendererCallback.call(gridView, eventsCollection)

			// Cache the event collection by channel ID and timeslice index
			var channelId = eventsCollection[0].channel.id;
			var cacheKey = channelId + '|' + sliceIndex;
			eventCollectionsCache[cacheKey] = eventsCollection;
		});
	}


	return {

		getEventsForGrid: function(channelIds, zeroTime, leftBorderTime, rightBorderTime, eventsCollectionRendererCallback, gridView) {
			var self = this;

			// Find out what time slices the left and right border time belong to
			var leftBorderSliceIndex = getSliceIndexFromTime(zeroTime, leftBorderTime);
			var rightBorderSliceIndex = getSliceIndexFromTime(zeroTime, rightBorderTime);

			for (var sliceIndex=leftBorderSliceIndex; sliceIndex<=rightBorderSliceIndex; sliceIndex++) {
				getEventsForSliceIndex(sliceIndex, channelIds, zeroTime, eventsCollectionRendererCallback, gridView);
			}
		}
	}

});