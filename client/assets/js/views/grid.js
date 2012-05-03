define([

	'config/grid',
	'controllers/app',
	'controllers/grid',
	'models/grid',
	'components/timebar',
	'components/channelbar',
	'components/buffer',
	'utils/epgapi',
	'utils/convert'

], function(GridConfig, App, GridController, GridModel, TimeBar, ChannelBar, Buffer, EpgApi, convert) {

/* private */

	var g = GridConfig,

	/**
	 * The EPG API returns dates (event.startDateTime, event.endDateTime)
	 * in the format YYYY-MM-DDThh:mmZ. Safari can't use this string as a
	 * parameters for a new Date constructor.
	 */
	parseApiDate = function(apiDate) {
		var dt;
		if (typeof(apiDate) === 'string') {
			dt = new Date(apiDate.slice(0,4), parseInt(apiDate.slice(5,7),10) -1, parseInt(apiDate.slice(8,10),10), parseInt(apiDate.slice(11,13),10), parseInt(apiDate.slice(14,16),10));
		}
		return dt;
	},


	renderEvents = function(events) {

		var link, description, i, event, width, left, startDateTime, endDateTime;

		for (i = 0; i < events.length; i++) {

			event = events[i];

			// Avoid duplicate DOM elements
			if ( $('#event-' + event.id)[0] ) {
				//console.log('duplication avoided');
				return;
			}

			startDateTime = parseApiDate(event.startDateTime);
			endDateTime = parseApiDate(event.endDateTime);

			width = convert.timeToPixels(endDateTime, startDateTime);
			left = convert.timeToPixels(startDateTime, g.ZERO);

			link = $('<a>')
				.addClass('programme')
				.attr({ 'id': event.programme.id, 'href': '/programme/' + event.programme.id, 'title': event.programme.title })
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

		g.$body.trigger(g.GRID_RENDERED);

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
			channelbar	: ChannelBar.initialize(),
			buffer		: Buffer.initialize()
		};

		// add logo behavior, move to 'now'
		$('.upc-logo').click(function(event){ TimeBar.goTo('now'); });

		/** 
		*	Events handlers
		*/

		// scrolling handlers
		var executionTimer,
			handler = function(e) {

				g.$body.trigger(g.GRID_MOVED);

				if (executionTimer) {
					clearTimeout(executionTimer);
				}

				executionTimer = setTimeout(function() { GridView.getEvents(); }, 200);
			};

		g.$window.on('resize scroll', handler);

		g.$body.on('eventsReceived', function(event, results) {
			renderEvents(results);
		});

		// Get first events | No need because the thicker starts the movement.
		GridView.getEvents();

		return this;

	};

	GridView.getEvents = function() {

		var selectedChannels = ChannelBar.getSelectedChannels(2),
			selectedTime = TimeBar.getSelectedTime();

		EpgApi.getEventsForChannels(selectedChannels, selectedTime.startTime, selectedTime.endTime);
	
		return this;
	};

	return GridView;

});