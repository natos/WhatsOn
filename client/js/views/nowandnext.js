/* 
* NowAndNextView 
* -------------
*
*/

define([

	'config/channel',
	'config/nowandnext',
	'modules/event',
	'lib/flaco/view',
	'models/channel',
	'models/nowandnext',
	'utils/convert',
	'utils/dom'

], function NowAndNextViewContext(channelConfig, nowAndNextConfig, Event, View, ChannelModel, nowAndNextModel, convert, dom) {

	var name = 'nowandnext';

/* private */

	// Create some default elements that will be cloned when we build the DOM
	var _progressBar = dom.element('div', {'class' : 'progressbar'});
	var _eventTitle = dom.element('h1', {'class' : 'event-title'});
	var _eventTimeBox = dom.element('div', {'class' : 'event-time-box'});
	var _eventStartTime = dom.element('time', {'class' : 'event-starttime'});
	var _eventChannel = dom.element('aside', {'class' : 'event-channel'});
	var _eventHeader = dom.element('div', {'class' : 'event-header'});
	var _eventArticle = dom.element('article', {'class' : 'event'});

	var renderPageStructure = function() {

		var nowAndNextContent = document.getElementById('nowandnext-content');

		if (!nowAndNextContent) {
			nowAndNextContent = dom.element('div', {id: 'nowandnext-content'});

			var channels = ChannelModel[channelConfig.GROUPS][ChannelModel[channelConfig.SELECTED_GROUP]]; // array of channel objects
			var channelsLength = channels.length;
			var channelArticle, i;

			for (i=0; i<channelsLength; i++) {
				channelArticle = dom.element('article', {
					'class':'event-list-container hidden',
					'id':'eventListContainer-' + channels[i].channelId
				});
				nowAndNextContent.appendChild(channelArticle);
			}
			dom.content.appendChild(nowAndNextContent);
		} else {
			nowAndNextContent.style.display = '';
		}

	};

	var onNowAndNextModelChanged = function(changes) {
		if (changes.eventsForChannel) {
			renderEventsForChannel(changes.eventsForChannel);
		}
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

	var renderEventsForChannel = function(channelEvents) {

		var channelEventsCount = channelEvents.length;
		var channelId = channelEvents[0].channel.id;
		var eventListContainer = document.getElementById('eventListContainer-' + channelId);
		var nowDateTime, startDateTime, endDateTime, startTimeValue, endTimeValue, percentageComplete, template;
		var channelEvent, viewData, i;

		var channelLink = document.createElement('a');
		channelLink.href = '/channel/' + channelId;

		var eventList = dom.element('ul', {'class' : 'event-list nowandnext-event-list'});

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

		dom.empty(eventListContainer);
		eventListContainer.appendChild(channelLink);
		eventListContainer.className = 'event-list-container'; // removes the '.hidden' class.
	};


/* public */

/* abstract */

	function initialize() {

		Event.on(nowAndNextConfig.MODEL_CHANGED, onNowAndNextModelChanged);
		return this;

	}

	function render() {

		renderPageStructure();

		return this;

	}

	function finalize() {

		var nowAndNextContent = document.getElementById('nowandnext-content');
		if (nowAndNextContent) {
			nowAndNextContent.style.display = 'none';
		}

		Event.off(nowAndNextConfig.MODEL_CHANGED, onNowAndNextModelChanged);
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