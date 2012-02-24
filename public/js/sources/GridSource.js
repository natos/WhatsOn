/** GridSource
* Data source for Events in the grid
*/
define([
	// Dependencies
], 

function() {

	var HOURS_PER_SLICE = 4;

	var getSliceStartTimeFromSliceIndex = function(zeroTime, sliceIndex) {
		return new Date(zeroTime.getFullYear(), zeroTime.getMonth(), zeroTime.getDate(), sliceIndex * HOURS_PER_SLICE, 0, 0);
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

	return {

		getEventsForGrid: function(channelIds, leftBorderTime, rightBorderTime, eventRendererCallback, gridView) {
			var self = this;

			// Split channels into batches of 5
			var channelBatches = [];
			var batchSize = 5;
			var batchesCount = Math.ceil(channelIds.length / batchSize);
			for (var i=0; i<batchesCount; i++) {
				channelBatches[i] = channelIds.slice( batchSize * i, batchSize * (i+1) );
			}

			console.log(channelBatches);

			for (var i=0; i<channelBatches.length; i++) {
				var requestTime = leftBorderTime.toISOString().slice(0,16) + 'Z'; 
				var request = 'http://tvgids.upc.nl/cgi-bin/WebObjects/EPGApi.woa/api/Channel/' + channelBatches[i].join('|') + '/events/NowAndNext_' + requestTime + '.json?batchSize=10&callback=?';
				console.log(request);
				$.getJSON(request, function(apiResponse) {
					self.processApiResponse(apiResponse, eventRendererCallback, gridView);
				});
			}
		}

	,	processApiResponse: function(apiResponse, eventRendererCallback, gridView) {
			var eventsCollections = [];
			if ($.isArray($(apiResponse)[0])) {
				// response contains multiple channels (events collections)
				$(apiResponse).each(function(i, eventsCollection) {
					eventsCollections.push(eventsCollection);
				});
			} else {
				// response contains a single channel (events collection)
				eventsCollections[0] = $(apiResponse);
			}

			$.each(eventsCollections, function(i, eventsCollection) {
				if (!eventsCollection.length ) {
					console.log("Warning: eventCollection is an empty array");
					console.log(apiResponse);
					return;
				}

				$(eventsCollection).each(function(j, event){
					eventRendererCallback.call(gridView, event);
				});
			});
		}
	}

});