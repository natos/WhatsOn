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
	var API_CHANNEL_BATCH_SIZE = 10; // How many channels are retrieved per batch
	var API_EVENTS_BATCH_SIZE = 3; // How many events are returned for each channel
	var nowAndNextPageTemplate = document.getElementById('now-and-next-page-template').innerHTML;
	var channelLogoUrls = {};
	var channelNames = {};

	// Create some default elements that will be cloned when we build the DOM
	var _eventList = document.createElement('ul');
	_eventList.className = 'event-list nowandnext-event-list';
	var _progressBar = document.createElement('div');
	_progressBar.className = 'progressbar';
	var _eventTitle = document.createElement('h1');
	_eventTitle.className = 'event-title';
	var _eventTimeBox = document.createElement('div');
	_eventTimeBox.className = 'event-time-box';
	var _eventStartTime = document.createElement('time');
	_eventStartTime.className = 'event-starttime';
	var _eventChannel = document.createElement('aside');
	_eventChannel.className = 'event-channel';
	var _eventHeader = document.createElement('div');
	_eventHeader.className = 'event-header';
	var _eventArticle = document.createElement('article');
	_eventArticle.className = 'event';


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
		var eventListContainer = document.getElementById('eventListContainer-' + channelId);
		var channelEvent;
		var viewData;
		var nowDateTime, startDateTime, endDateTime, startTimeValue, endTimeValue, percentageComplete, template;

		var channelLink = document.createElement('a');
		channelLink.href = '/channel/' + channelId;

		var eventList = _eventList.cloneNode(false);

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
				time: channelEvent.startDateTime.slice(11,16),
				percentageComplete: percentageComplete,
				title: channelEvent.programme.title
			};

			if (i===0) {
				eventList.appendChild(buildNowEvent(viewData));
			} else {
				eventList.appendChild(buildNextEvent(viewData));
			}
		}

		channelLink.appendChild(eventList);

		eventListContainer.appendChild(channelLink);
		eventListContainer.className = 'event-list-container'; // removes the '.hidden' class.
	};

	var buildNowEvent = function(viewData) {
		var el = document.createElement('li');

		var progressBar = _progressBar.cloneNode(false);
		progressBar.style.width = viewData.percentageComplete + '%';

		var eventTitle = _eventTitle.cloneNode(false);
		eventTitle.appendChild(document.createTextNode(viewData.title));

		var eventChannel = _eventChannel.cloneNode(false);
		eventChannel.style.backgroundImage = 'url(' + viewData.channelLogoUrl + ')';

		var eventHeader = _eventHeader.cloneNode(false);
		var eventArticle = _eventArticle.cloneNode(false);
		eventArticle.className = 'event now';

		eventHeader.appendChild(progressBar);
		eventHeader.appendChild(eventTitle);
		eventArticle.appendChild(eventHeader);
		eventArticle.appendChild(eventChannel);
		el.appendChild(eventArticle);

		return el;
	};

	var buildNextEvent = function(viewData) {
		var el = document.createElement('li');

		var eventTitle = _eventTitle.cloneNode(false);
		eventTitle.appendChild(document.createTextNode(viewData.title));

		var eventStartTime = _eventStartTime.cloneNode(false);
		eventStartTime.appendChild(document.createTextNode(viewData.time));

		var eventHeader = _eventHeader.cloneNode(false);
		var eventArticle = _eventArticle.cloneNode(false);
		var eventTimeBox = _eventTimeBox.cloneNode(false);

		eventTimeBox.appendChild(eventStartTime);
		eventArticle.appendChild(eventTimeBox);
		eventHeader.appendChild(eventTitle);
		eventArticle.appendChild(eventHeader);
		el.appendChild(eventArticle);
		
		return el;
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