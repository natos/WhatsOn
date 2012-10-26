/*
* NowAndNextController
* -------------
*
*/

define([

	'modules/zepto',
	'config/channel',
	'config/app',
	'config/nowandnext',
	'lib/flaco/controller',
	'modules/event',
	'models/channel',
	'models/nowandnext',
	'views/nowandnext'

], function NowAndNextController($, channelConfig, appConfig, nowAndNextConfig, Controller, Event, ChannelModel, nowAndNextModel, nowAndNextView) {

	var name = 'nowandnext';

/* private */

	var API_CHANNEL_BATCH_SIZE = 10; // How many channels are retrieved per batch

	var handleChannelsBatchResponse = function(apiResponse) {
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
				nowAndNextModel.set('eventsForChannel', eventsForChannel[channelId]);
			}

		}
	};

	var handleSingleChannelResponse = function(apiResponse) {
		if (apiResponse && apiResponse.data) {
			nowAndNextModel.set('overlay_eventsForChannel', apiResponse.data);
		}
	};

	// Given a date, return a string in the format 'YYYY-MM-DDTHH:MMZ',
	// which is the format the EPG api accepts for marking the start time.
	var getExactFormattedSliceStartTime = function(dt) {
	// note: this is the same as utils/convert.formatTimeForApiRequest() method
		return dt.getUTCFullYear().toString() + '-' + ('00' + (dt.getUTCMonth() + 1).toString()).slice(-2) + '-' + ('00' + dt.getUTCDate().toString()).slice(-2) + 'T' + ('00' + dt.getUTCHours().toString()).slice(-2) + ':' + ('00' + dt.getUTCMinutes().toString()).slice(-2) + 'Z';
	};


	var getNowAndNextForChannels = function(channelIdsToFetch) {
	// note: this is already solved on utils/epgiapi
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

			// API calls should be solved inside utils/EpgApi 
			$.getJSON(request, handleChannelsBatchResponse);
		}
	};

	var onFetchChannel = function(channelId) {
		// Go and get single channel info from api
		var formattedSliceStartTime = getExactFormattedSliceStartTime(new Date());
		var request = appConfig.API_PREFIX +
			'/linearServices/' + channelId + '/events.json' +
			'?show=start,end,service.id,programme.id,programme.title' +
			'&sort=start' +
			'&end>=' + formattedSliceStartTime +
			'&maxBatchSize=128' +
			'&callback=?';

		$.getJSON(request, handleSingleChannelResponse);
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

		Event.on(nowAndNextConfig.FETCH_CHANNEL, onFetchChannel);

		return this;

	}

	function finalize() {

		Event.off(nowAndNextConfig.FETCH_CHANNEL, onFetchChannel);

		return this;

	}

/* export */

	return new Controller({
		name		: name,
		initialize	: initialize,
		finalize	: finalize,
		view		: nowAndNextView
	});

});