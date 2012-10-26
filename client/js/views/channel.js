/* 
* ChannelView
* -----------
*
* Controlls channel page
*
*/
define([
	
	'config/channel',
	'lib/flaco/view',
	'lib/mustache/mustache',
	'modules/event',
	'components/social',
	'models/channel'

], function ChannelViewScope(channelConfig, View, Mustache, Event, Social, ChannelModel) {

	var name = 'channel',

		components = {
			//social: Social
		};

/* private */

	var onChannelModelChanged = function(changes) {
		if (changes.eventsForChannel) {
			renderEventsForChannel(changes.eventsForChannel);
		}
	};

	var renderChannelHeader = function() {
		var channelId = 's-' + ChannelModel.currentChannelId;
		var channel = ChannelModel.byId[channelId];

		var canvas = document.getElementById('content');
		var channelPageTemplate = document.getElementById('channel-page-template').innerHTML;
		var viewData = {
			broadcastFormat: '[SD|HD] TODO', // TODO
			name: channel.name,
			logo: channel.logo,
			description: 'Blah blah blah description TODO'
		};

		canvas.innerHTML = Mustache.render(channelPageTemplate, viewData);
	};

	// TODO: Group by date
	var renderEventsForChannel = function(events) {
		var eventsForChannelSection = document.getElementById('channel-content-events');
		if (!eventsForChannelSection) {
			eventsForChannelSection = document.createElement('section');
			eventsForChannelSection.className = 'event-list-container';
			var channelContent = document.getElementById('channel-content');
			channelContent.appendChild(eventsForChannelSection);
		}

		var html = '<ul class="event-list channel-event-list">';
		var eventsCount = events.length;
		var eventTemplate = '<li><a href="/programme/{{programmeId}}"><article class="{{eventClassName}}"><div class="event-time-box"><time class="event-starttime">{{startTime}}</time></div><div class="event-header"><div class="progressbar" style="width:{{percentageComplete}}%"></div><h1 class="event-title">{{programmeTitle}}</h1></div></article></a></li>';

		for (var i=0; i<eventsCount; i++) {
			var event = events[i];
			var nowTimeValue = new Date();
			var startDateTime = new Date(event.startDateTime);
			var endDateTime = new Date(event.endDateTime);
			var day = startDateTime.getDay();
			var hours = startDateTime.getHours();
			hours = (hours < 10)? '0' + hours : hours;
			var minutes = startDateTime.getMinutes();
			minutes = (minutes < 10)? '0' + minutes : minutes;
			var time = (hours + ':' + minutes);
			var startTimeValue = startDateTime.valueOf();
			var endTimeValue = endDateTime.valueOf();
			var percentageComplete = (100 * (nowTimeValue - startTimeValue)) / (endTimeValue - startTimeValue);

			var viewData = {
				eventClassName : (percentageComplete>0) ? 'event now' : 'event',
				programmeId : event.programme.id,
				startTime : time,
				programmeTitle : event.programme.title,
				percentageComplete : percentageComplete
			};
			html += Mustache.render(eventTemplate, viewData);
		}
		html += '</ul>';
		eventsForChannelSection.innerHTML = html;
	};

/* public */

	function initialize(State) {

		Event.on(channelConfig.MODEL_CHANGED, onChannelModelChanged);
		return this;

	}

	function render() {

		renderChannelHeader();

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
		components	: components
	});

});