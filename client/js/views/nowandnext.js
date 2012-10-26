/* 
* NowAndNextView 
* -------------
*
*/

define([

	'config/app',
	'config/channel',
	'config/nowandnext',
	'modules/event',
	'lib/flaco/view',
	'models/channel',
	'models/nowandnext',
	'utils/convert',
	'utils/dom',
	'utils/language',
	'components/overlay'

], function NowAndNextViewContext(appConfig, channelConfig, nowAndNextConfig, Event, View, ChannelModel, nowAndNextModel, convert, dom, Language, overlay) {

	var name = 'nowandnext',

		components = {
			overlay 	: overlay
		};

/* private */

	var _lang;

	// Create some default elements that will be cloned when we build the DOM
	var _progressBar = dom.element('div', {'class' : 'progressbar'});
	var _eventTitle = dom.element('h1', {'class' : 'event-title'});
	var _eventTimeBox = dom.element('div', {'class' : 'event-time-box'});
	var _eventStartTime = dom.element('time', {'class' : 'event-starttime'});
	var _eventChannel = dom.element('aside', {'class' : 'event-channel'});
	var _eventHeader = dom.element('div', {'class' : 'event-header'});
	var _eventArticle = dom.element('article', {'class' : 'event'});
	var _channelLink = dom.element('a', {'data-action' : 'OVERLAY'});

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
					'id':'eventListContainer-' + channels[i].id
				});
				nowAndNextContent.appendChild(channelArticle);
			}
			dom.content.appendChild(nowAndNextContent);
		} else {
			nowAndNextContent.style.display = '';
		}

	};

	var onModelChanged = function(changes) {

		if (changes.eventsForChannel) {
			renderEventsForChannel(changes.eventsForChannel);
		}

		if (changes.overlay_eventsForChannel) {
			renderChannelOverlay(changes.overlay_eventsForChannel);
		}

	};

	var renderChannelOverlay = function(eventsForChannel) {
		var channelId = eventsForChannel[0].service.id;
		var channel = ChannelModel.byId[channelId];
		var render = [];
		var genreNames = [];
		var genresCount, eventsCount, startDateTime, e;
		var currentDay = new Date().getDay();
		var dayIterator = 0;
		var dayName;

		render.push('<h1><img src="', channel.logo, '"> ' + channel.name + '</h1>');
		if (channel.genres && channel.genres.data && channel.genres.data.length) {
			genresCount = channel.genres.data.length;
			for (i=0; i<genresCount; i++) {
				genreNames.push(channel.genres.data[i].name);
			}
			render.push('<p>' + genreNames.join(', ') + '</p>');
		}

		render.push('<h2>' + _lang.translate('day-today') + '</h2><ul>');

		eventsCount = eventsForChannel.length;
		for (i=0; i<eventsCount; i++) {
			e = eventsForChannel[i];
			startDateTime = new Date(convert.parseApiDateStringAsMilliseconds(e.start));
			render.push(
				'<li class="event-list-item-simple"><time>',
				('0' + startDateTime.getHours()).slice(-2) + ':' + ('0' + startDateTime.getMinutes()).slice(-2),
				'</time>',
				e.programme.title,
				'</li>'
			);

			if (startDateTime.getDay() !== currentDay) {
				currentDay = startDateTime.getDay();
				dayIterator += 1;
				if (dayIterator===1) {
					dayName = _lang.translate('day-tomorrow');
				} else {
					dayName = _lang.translate('day-' + currentDay);
				}
				render.push('</ul><h2>' + dayName + '</h2><ul>');
			}
		}

		render.push('</ul>');

		overlay.show(render.join('\n'));
	
	};

	var appendNowEvent = function(targetElement, channelEvent) {

		var nowDateTime = new Date();
		var startDateTime = new Date(convert.parseApiDateStringAsMilliseconds(channelEvent.start));
		var endDateTime = new Date(convert.parseApiDateStringAsMilliseconds(channelEvent.end));
		var nowTimeValue = nowDateTime.valueOf();
		var startTimeValue = startDateTime.valueOf();
		var endTimeValue = endDateTime.valueOf();
		var percentageComplete = (100 * (nowTimeValue - startTimeValue)) / (endTimeValue - startTimeValue);

		var eventListItem = dom.element('li');

		var progressBar = _progressBar.cloneNode(false);
		progressBar.style.width = percentageComplete + '%';

		var eventTitle = _eventTitle.cloneNode(false);
		eventTitle.appendChild(document.createTextNode(channelEvent.programme.title));

		var eventChannel = _eventChannel.cloneNode(false);
		eventChannel.style.backgroundImage = 'url(' + ChannelModel.byId[channelEvent.service.id].logo + ')';

		var eventHeader = _eventHeader.cloneNode(false);
		var eventArticle = _eventArticle.cloneNode(false);
		eventArticle.className = 'event now';

		eventHeader.appendChild(progressBar);
		eventHeader.appendChild(eventTitle);
		eventArticle.appendChild(eventHeader);
		eventArticle.appendChild(eventChannel);
		eventListItem.appendChild(eventArticle);

		targetElement.appendChild(eventListItem);
	};

	var appendNextEvent = function(targetElement, channelEvent) {

		var eventListItem = document.createElement('li');
		eventListItem.className = 'event-list-item-simple';

		var eventStartTime = _eventStartTime.cloneNode(false);
		eventStartTime.appendChild(document.createTextNode(channelEvent.start.slice(11,16)));
		eventListItem.appendChild(eventStartTime);
		eventListItem.appendChild(document.createTextNode(channelEvent.programme.title));

		targetElement.appendChild(eventListItem);
	};

	var renderEventsForChannel = function(channelEvents) {
		if (channelEvents && channelEvents.length) {

			var maxEventsToRender = channelEvents.length;
			var channelId = channelEvents[0].service.id;
			var eventListContainer = document.getElementById('eventListContainer-' + channelId);
			var channelLink = _channelLink.cloneNode(true);
			var eventList = dom.element('ul', {'class' : 'event-list nowandnext-event-list'});
			var i;

			// "now" event
			appendNowEvent(eventList, channelEvents[0]);

			// "next" events.
			if (maxEventsToRender > 3) {
				maxEventsToRender = 3;
			}
			for (i=1; i< maxEventsToRender; i++) {
				appendNextEvent(eventList, channelEvents[i]);
			}

			channelLink.appendChild(eventList);
			channelLink.href = '/channel/' + channelId;
			channelLink.setAttribute('data-channelId', channelId);

			dom.empty(eventListContainer);
			eventListContainer.appendChild(channelLink);
			eventListContainer.className = 'event-list-container'; // removes the '.hidden' class.

		}

	};

	var hidePageStructure = function() {
		var nowAndNextContent = document.getElementById('nowandnext-content');
		if (nowAndNextContent) {
			//nowAndNextContent.style.display = 'none';
			nowAndNextContent.parentNode.removeChild(nowAndNextContent);
		}
	};

	var onAppAction = function (action, event) {

		var el, channelId;

		if (action === 'OVERLAY') {

			event.preventDefault();

			// The router module hands us the original event,
			// which was raised on the source element. We need to
			// reach the target element that has the data-action attribute on it.
			el = event.target;
			while (el.parentNode) {
				if (el.getAttribute('data-action')) {
					channelId = el.getAttribute('data-channelId');

					if (channelId) {
						Event.emit(nowAndNextConfig.FETCH_CHANNEL, channelId);
						overlay.show();
					}

					break;
				} else {
					el = el.parentNode;
				}
			}
		}
	};


/* public */

/* abstract */

	function initialize() {

		_lang = new Language(app.selectedLanguageCode);

		Event.on(nowAndNextConfig.MODEL_CHANGED, onModelChanged);
		Event.on(appConfig.ACTION, onAppAction);

		return this;

	}

	function render() {

		renderPageStructure();

		return this;

	}

	function finalize() {

		hidePageStructure();

		Event.off(nowAndNextConfig.MODEL_CHANGED, onModelChanged);
		Event.off(appConfig.ACTION, onAppAction);

		return this;

	}


/* export */

	return new View({
		name		: name,
		initialize	: initialize,
		finalize	: finalize,
		render		: render,
		components	: components
	});

});