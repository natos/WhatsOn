/* 
* NowAndNextView 
* -------------
*
*/

define([

	'config/channel',
	'lib/flaco/view',
	'models/channel',
	'lib/mustache/mustache',
	'utils/convert'

], function NowAndNextViewContext(channelConfig, View, ChannelModel, Mustache, convert) {

	var name = 'nowandnext';

/* private */

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

	var renderPageStructure = function() {

		var canvas = document.getElementById('content');
		var viewData;
		var channels = ChannelModel[channelConfig.GROUPS][ChannelModel[channelConfig.SELECTED_GROUP]]; // array of channel objects
		var nowAndNextPageTemplate = document.getElementById('now-and-next-page-template').innerHTML;

		// Render empty <li> containers for each channel. These will be filled with events later.
		viewData = {channels:channels};
		canvas.innerHTML = Mustache.render(nowAndNextPageTemplate, viewData);

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



/* public */

	var renderEventsForChannel = function(channelEvents) {
		var channelEventsCount = channelEvents.length;
		var channelId = channelEvents[0].channel.id;
		var eventListContainer = document.getElementById('eventListContainer-' + channelId);
		var nowDateTime, startDateTime, endDateTime, startTimeValue, endTimeValue, percentageComplete, template;
		var channelEvent, viewData, i;

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
				channelLogoUrl: ChannelModel.byId['s-' + channelEvent.channel.id].logo,
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

/* abstract */

	function initialize() {

		return this;

	}

	function render() {

		renderPageStructure();

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
		render		: render,
		renderEventsForChannel : renderEventsForChannel
	});

});