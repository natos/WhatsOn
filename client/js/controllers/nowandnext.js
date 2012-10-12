/*
* NowAndNextController
* -------------
*
*/

define([

	'modules/zepto',
	'config/channel',
	'config/app',
	'lib/flaco/controller',
	'modules/event',
	'models/channel',
	'models/nowandnext',
	'views/nowandnext'

], function NowAndNextController($, channelConfig, appConfig, Controller, Event, ChannelModel, NowAndNextModel, NowAndNextView) {

	var name = 'nowandnext';

/* private */

	var API_CHANNEL_BATCH_SIZE = 10; // How many channels are retrieved per batch

	var handleApiResponse = function(apiResponse) {
		var eventsInBatch, e, i, channelId, eventsCount;
		var eventsForChannel = {};

		if (apiResponse && apiResponse.data) {

			// Group events by channel
			eventsCount = apiResponse.data.length;
			for (i=0; i< eventsCount; i++) {
				e = apiResponse.data[i];
				channelId = e.service.id;
				if (!eventsForChannel[channelId]) {
					eventsForChannel[channelId] = [];
				}
				eventsForChannel[channelId].push(e);
			}

			for (channelId in eventsForChannel) {
				NowAndNextModel.set('eventsForChannel', eventsForChannel[channelId]);
			}

		}
	};

	// Given a date, return a string in the format 'YYYY-MM-DDTHH:MMZ',
	// which is the format the EPG api accepts for marking the start time.
	var getExactFormattedSliceStartTime = function(dt) {
		return dt.getUTCFullYear().toString() + '-' + ('00' + (dt.getUTCMonth() + 1).toString()).slice(-2) + '-' + ('00' + dt.getUTCDate().toString()).slice(-2) + 'T' + ('00' + dt.getUTCHours().toString()).slice(-2) + ':' + ('00' + dt.getUTCMinutes().toString()).slice(-2) + 'Z';
	};

	var getNowAndNextForChannels = function(channelIdsToFetch) {
		var formattedSliceStartTime = getExactFormattedSliceStartTime(new Date());
		var i, j, channelIdBatch, batchesCount, request;

		// The API accepts requests for batches of channels.
		batchesCount = Math.ceil(channelIdsToFetch.length / API_CHANNEL_BATCH_SIZE);
		for (i=0; i<batchesCount; i++) {
			channelIdBatch = channelIdsToFetch.slice( API_CHANNEL_BATCH_SIZE * i, API_CHANNEL_BATCH_SIZE * (i+1) );
			request = appConfig.API_PREFIX +
				'/linearServices/' + channelIdBatch.join(',') + '/events.json' +
				'?show=start,end,service.id,programme.id,programme.title' +
				'&sort=start' +
				'&end>=' + formattedSliceStartTime +
				'&maxBatchSize=' + (API_CHANNEL_BATCH_SIZE * 5) +
				'&callback=?';

			$.getJSON(request, handleApiResponse);
		}
	};



/* public */

/* abstract */

	function initialize() {

		var channels = ChannelModel[channelConfig.GROUPS][ChannelModel[channelConfig.SELECTED_GROUP]]; // array of channel objects
		var channelsCount = channels.length;
		var channelIdsToFetch = [];
		var i;

		// Start the API calls to fill the channels with events
		for (i=0; i<channelsCount; i++) {
			channelIdsToFetch.push(channels[i].id);
		}
		getNowAndNextForChannels(channelIdsToFetch);

		return this;

	}

	function finalize() {

		return this;

	}

/* export */

	return new Controller({
		name		: name,
		initialize	: initialize,
		finalize	: finalize,
		view		: NowAndNextView
	});

});