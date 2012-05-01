define([

	'config/grid',
	'controllers/app',
	'controllers/grid',
	'models/grid',
	'components/timebar',
	'components/channelbar',
	'utils/epgapi'

], function(GridConfig, App, GridController, GridModel, TimeBar, ChannelBar, EpgApi) {

/* private */

	var g = GridConfig,

	renderEvents = function(events) {

		var link, description, i, event, width, left, startDateTime, endDateTime, offsetTime, duration;

		for (i = 0; i < events.length; i++) {

			event = events[i];

			// Avoid duplicate DOM elements
			if ( $('#event-' + event.id)[0] ) {
				//console.log('duplication avoided');
				return;
			}

			startDateTime = new Date(event.startDateTime);
			endDateTime = new Date(event.endDateTime);

			duration = ( endDateTime.valueOf() - startDateTime.valueOf() ) / g.MILLISECONDS_IN_HOUR; // hours
			width = Math.floor( duration * g.HOUR_WIDTH ); // pixels

			offsetTime = ( startDateTime.valueOf() - g.ZERO.valueOf() ) / g.MILLISECONDS_IN_HOUR; // hours
			left = Math.floor(offsetTime * g.HOUR_WIDTH);

			link = $('<a>')
				.addClass('programme')
				.attr({ 'id': event.programme.id, 'href': '/programme/' + event.programme.id })
				.text(event.programme.title);

			description = $('<p>')
				.addClass('description')
				.text(event.programme.shortDescription);

			$('<div>')
				.attr('id', 'event-' + event.id)
				.addClass('grid-event')
				.append(link)
				.append(description)
				.css({
					'position': 'absolute',
					'width': width + 'px',
					'height': g.ROW_HEIGHT + 'px',
					'left': left + 'px'
				})
				.appendTo('#cc_' + event.channel.id);
		}

	};


/* @class GridView */
var GridView = {};

	/* constructor */
	GridView.initialize = function() {

		// Let the App know your here
		App.views.grid = this;

		/** 
		*	Modules Setup
		*/

		// setup configuration
		this.config = GridConfig.initialize();

		// setup model
		this.model = GridModel.initialize();

		// setup controller
		this.controller = GridController.initialize();

		// setup components
		this.components = {
			timebar		: TimeBar.initialize(),
			channelbar	: ChannelBar.initialize()
		};

		/** 
		*	Events handlers
		*/

		// scrolling handlers
		var executionTimer,
			handler = function(e) {

				g.$body.trigger('grid:moved');

				if (executionTimer) {
					clearTimeout(executionTimer);
				}

				executionTimer = setTimeout(function() { GridView.getEvents(); }, 200);
			};

		g.$window.on('scroll', handler);

		g.$body.on('eventsReceived', function(event, results) {
			renderEvents(results);
		});

		// Get first events
		GridView.getEvents();

		return this;

	};

	GridView.getEvents = function() {

		EpgApi.getEventsForChannels(ChannelBar.getSelectedChannels(), TimeBar.getSelectedTime().startTime, TimeBar.getSelectedTime().endTime);

	};

	return GridView;

});