/* 
* NowAndNextView 
* -------------
*
*/

define([

	'config/app',
	'config/channel',
	'modules/app',
	'lib/flaco/view',
	'models/channel',
	'lib/mustache/mustache',
	'utils/convert'

], function NowAndNextViewContext(a, c, App, View, ChannelModel, Mustache, convert) {

	var name = 'nowandnext';
	var API_CHANNEL_BATCH_SIZE = 5;
	var API_EVENTS_BATCH_SIZE = 4;
	var nowAndNextPageTemplate = document.getElementById('now-and-next-page-template').innerHTML;
	// var nowAndNextChannelRowEventTemplate = document.getElementById('now-and-next-channel-row-event-template').innerHTML;
	var nowAndNextChannelRowNowEventTemplate = document.getElementById('now-and-next-channel-row-now-event-template').innerHTML;
	var nowAndNextChannelRowNextEventTemplate = document.getElementById('now-and-next-channel-row-next-event-template').innerHTML;
	var channelLogoUrls = {};
	var channelNames = {};

/* private */

	// Given a date, return a string in the format 'YYYY-MM-DDTHH:MMZ',
	// which is the format the EPG api accepts for marking the start time.
	var getExactFormattedSliceStartTime = function(dt) {
		return dt.getUTCFullYear().toString() + '-' + ('00' + (dt.getUTCMonth() + 1).toString()).slice(-2) + '-' + ('00' + dt.getUTCDate().toString()).slice(-2) + 'T' + ('00' + dt.getUTCHours().toString()).slice(-2) + ':' + ('00' + dt.getUTCMinutes().toString()).slice(-2) + 'Z';
	};

	var handleApiResponse = function(apiResponse) {
		var channelsInBatch;
		var i;
		if (apiResponse) {
			channelsInBatch = apiResponse.length;
			for (i=0; i< channelsInBatch; i++) {
				renderEventsForChannel(apiResponse[i]);
			}
		}
	};

	var renderEventsForChannel = function(channelEvents) {
		var channelEventsCount = channelEvents.length;
		var i;
		var channelId = channelEvents[0].channel.id;
		var channelRowLink = document.getElementById('channelRowLink-' + channelId);
		var channelEvent;
		var viewData;
		var nowDateTime, startDateTime, endDateTime, startTimeValue, endTimeValue, percentageComplete, template;

		var html = "";
		for (i=0; i< channelEventsCount; i++) {
			channelEvent = channelEvents[i];

			nowDateTime = new Date();
			startDateTime = new Date(convert.parseApiDateStringAsMilliseconds(channelEvent.startDateTime));
			endDateTime = new Date(convert.parseApiDateStringAsMilliseconds(channelEvent.endDateTime));

			nowTimeValue = nowDateTime.valueOf();
			startTimeValue = startDateTime.valueOf();
			endTimeValue = endDateTime.valueOf();

			percentageComplete = (100 * (nowTimeValue - startTimeValue)) / (endTimeValue - startTimeValue);

			viewData = {
				channelName: channelEvent.channel.name,
				channelLogoUrl: channelLogoUrls[channelEvent.channel.id],
				className: (i===0) ? "event now" : "event",
				day: startDateTime.getDay(),
				time: channelEvent.startDateTime.slice(11,16),
				percentageComplete: percentageComplete,
				title: channelEvent.programme.title
			};

			template = (i===0) ? nowAndNextChannelRowNowEventTemplate : nowAndNextChannelRowNextEventTemplate;
			html += Mustache.render(template, viewData);
		}
		channelRowLink.innerHTML = html;
	};

	var getNowAndNextForChannels = function(channelIdsToFetch) {
		var i, j,
			formattedSliceStartTime = getExactFormattedSliceStartTime(new Date()),
			channelIdBatch,
			batchesCount,
			request;

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

		App.loadCss('/assets/css/nowandnext.css');

		return this;

	}

	function render() {
		var canvas = document.getElementById('content');
		var viewData;
		var channels = ChannelModel[c.GROUPS][ChannelModel[c.SELECTED_GROUP]]; // array of channel objects
		var channelsCount = channels.length;
		var channelIdsToFetch = [];
		var i;
		var channel;

		// Render empty <li> containers for each channel. These will be filled with events later.
		viewData = {channels:channels};
		canvas.innerHTML = Mustache.render(nowAndNextPageTemplate, viewData);

		// Start the API calls to fill the channels with events
		for (i=0; i<channelsCount; i++) {
			channel = channels[i];
            channelLogoUrls[channel.id] = 'http://www.upc.nl' + channel.logoIMG;
            channelNames[channel.id] = channel.name;
			channelIdsToFetch.push(channel.id);
		}
		getNowAndNextForChannels(channelIdsToFetch);

		return this;

	}

	function finalize() {

		return this;
	}


/* export */

	return new View({
		name		: name,
		initialize	: initialize,
		finalize	: finalize,
		render		: render
	});

});