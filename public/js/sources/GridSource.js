/** GridSource
* Data source for Events in the grid
*/
define([
	// Dependencies
], 

function() {

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

	return {

		getEventsForGrid: function(channelIds, zeroTime, leftBorderTime, rightBorderTime, eventRendererCallback, gridView) {
			var self = this;

			// Split channels into batches of 5
			var channelBatches = [];
			var batchSize = 5;
			var batchesCount = Math.ceil(channelIds.length / batchSize);
			for (var i=0; i<batchesCount; i++) {
				channelBatches[i] = channelIds.slice( batchSize * i, batchSize * (i+1) );
			}

			// Find out what time slices the left and right border time belong to
			console.log(leftBorderTime);
			console.log(rightBorderTime);
			var leftBorderSliceIndex = getSliceIndexFromTime(zeroTime, leftBorderTime);
			var rightBorderSliceIndex = getSliceIndexFromTime(zeroTime, rightBorderTime);

			for (var i=0; i<channelBatches.length; i++) {
				for (var j=leftBorderSliceIndex; j<=rightBorderSliceIndex; j++) {
					var sliceStartTime = getSliceStartTimeFromSliceIndex(zeroTime, j);
					var formattedSliceStartTime = formatTimeForApiRequest(sliceStartTime);
					var request = 'http://tvgids.upc.nl/cgi-bin/WebObjects/EPGApi.woa/api/Channel/' + channelBatches[i].join('|') + '/events/NowAndNext_' + formattedSliceStartTime + '.json?batchSize=10&callback=?';
					console.log(request);
					$.getJSON(request, function(apiResponse) {
						self.processApiResponse(apiResponse, eventRendererCallback, gridView);
					});
				}			
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