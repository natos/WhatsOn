/* 
* NowAndNextController 
* -------------
*
*/

define([

	'config/channel',
	'lib/flaco/controller',
	'modules/event',
	'models/channel',
	'models/nowandnext',
	'views/nowandnext'

], function NowAndNextController(channelConfig, Controller, Event, ChannelModel, NowAndNextModel, NowAndNextView) {

	var name = 'nowandnext';

/* private */

	var API_CHANNEL_BATCH_SIZE = 10; // How many channels are retrieved per batch
	var API_EVENTS_BATCH_SIZE = 3; // How many events are returned for each channel

	var handleApiResponse = function(apiResponse) {
		var channelsInBatch, i;

		if (apiResponse) {
			channelsInBatch = apiResponse.length;
			for (i=0; i< channelsInBatch; i++) {
				NowAndNextView.renderEventsForChannel(apiResponse[i]);
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
			request = 'http://tvgids.upc.nl/cgi-bin/WebObjects/EPGApi.woa/api/Channel/' + channelIdBatch.join('|') + '/events/NowAndNext_' + formattedSliceStartTime + '.json?batchSize=' + API_EVENTS_BATCH_SIZE + '&order=startDateTime&optionalProperties=Programme.subcategory&callback=?';
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
			channelIdsToFetch.push(channels[i].channelId);
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