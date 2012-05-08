/* 
* GridView 
* --------------
*
* Emitting events, UI changes
* Listen to the model for data changes
*
*/

define([

	'config/app',
	'config/grid',
	'components/buffer',
	'utils/convert'

], function GridViewScope(c, g, Buffer, convert) {

/* private */

	var executionTimer;

	function firstEvent() {

		upc.emit(c.VIEW_LOADED, this);

	}

	// scrolling handlers
	function handleReziseAndScroll(e) {

		upc.emit(g.GRID_MOVED);

		if (executionTimer) {
			clearTimeout(executionTimer);
		}

		executionTimer = setTimeout(function() {
			upc.emit(g.GRID_FETCH_EVENTS);
		}, 200);

	};

	// model changes handlers
	function modelChanged(obj) {
		if (obj.events) {
			renderEvents(obj.events);
		}
	};

	// Viewport styling
	function defineStyles() {

		// define constants
		g.TIMEBAR_HEIGHT = g.$timebar.height();
		g.CHANNELS_COUNT = g.$channelsbar.find('li').length;
		g.CHANNEL_BAR_WIDTH = g.$channelsbar.width();
		g.VIEWPORT_WIDTH_HOURS = (document.body.clientWidth - g.CHANNEL_BAR_WIDTH) / g.HOUR_WIDTH;
		// Size the grid
		g.GRID_HEIGHT = g.ROW_HEIGHT * g.CHANNELS_COUNT;
		g.GRID_WIDTH = g.HOUR_WIDTH * 24;

		var cssText = [];
			// Generate style rules for the heights and widths specific to the current browser
			cssText.push('#grid-container {height:' + g.GRID_HEIGHT + 'px;width:' + g.GRID_WIDTH + 'px;margin-left:' + g.CHANNEL_BAR_WIDTH + 'px;margin-top:' + g.TIMEBAR_HEIGHT + 'px;}');
			cssText.push('#grid-container .event {height:' + g.ROW_HEIGHT + 'px;}');
			cssText.push('#channels-bar li {height:' + g.ROW_HEIGHT + 'px;}');
			cssText.push('#time-bar ol {width:' + g.GRID_WIDTH + 'px;margin-left:' + g.CHANNEL_BAR_WIDTH + 'px;}');
			cssText.push('#time-bar li {width:' + g.HOUR_WIDTH + 'px;}');
			cssText.push('.channel-container {height:' + g.ROW_HEIGHT + 'px;}');

		return cssText.join('\n');

	};

	// Render events
	function renderEvents(events) {

		var link, description, i, event, width, left, startDateTime, endDateTime;

		for (i = 0; i < events[0].length; i++) {

			event = events[0][i];

			// Avoid rendering duplicate DOM elements
			if ( $('#event-' + event.id)[0] ) {
				// Don't render this event; skip to the next one.
				continue;
			}

			// Data
			startDateTime = convert.parseApiDate(event.startDateTime);
			endDateTime = convert.parseApiDate(event.endDateTime);

			width = convert.timeToPixels(endDateTime, startDateTime);
			left = convert.timeToPixels(startDateTime, g.ZERO);

			// DOM
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

		// triggers GRID_RENDERED
		upc.emit(g.GRID_RENDERED);

	};

	function getSelectedTime() {

		// How many hours have been scrolled horizontally?
		var hoursScrolledLeft = window.pageXOffset / g.HOUR_WIDTH,
			// Calculate the left border time, and right border time
			leftBorderTime = new Date(g.ZERO.valueOf() + (hoursScrolledLeft * g.MILLISECONDS_IN_HOUR) - (g.VIEWPORT_WIDTH_HOURS/4 * g.MILLISECONDS_IN_HOUR)),
			rightBorderTime = new Date(g.ZERO.valueOf() + (hoursScrolledLeft * g.MILLISECONDS_IN_HOUR) + (g.VIEWPORT_WIDTH_HOURS * g.MILLISECONDS_IN_HOUR));

		return {
			startTime: leftBorderTime,
			endTime: rightBorderTime
		};

	};

	function getSelectedChannels(extraAboveAndBelow) {

		// How many channels have been scrolled vertically?
		var channelsScrolledUp = window.pageYOffset / g.ROW_HEIGHT,
		firstChannel = (channelsScrolledUp < 0) ? 0 : Math.floor(channelsScrolledUp),
		// TODO: calculate this based on actual dimensions
		topOffset = 100,
		// How many channels tall is the screen?
		channelsTall = (window.innerHeight - topOffset) / g.ROW_HEIGHT,
		channelIds = [],
		i = 0;

		if (!extraAboveAndBelow) {
			extraAboveAndBelow = 0;
		}

		// Return 2 channels above and below the visible window 
		for (i = (0 - extraAboveAndBelow); i < (channelsTall + extraAboveAndBelow); i++) {
			if ( (firstChannel + i) < 0 || (firstChannel + i) >= channels.length ) {
				continue;
			}
			channelIds.push(channels[firstChannel + i].id);
		}

		return channelIds;

	};

	/* constructor */
	function initialize() {

		// set styles
		g.$styles.text( defineStyles() );

	/** 
	*	Events handlers
	*/

		// UI event handlers
		// every time user scrolls, we want to load new events
		g.$window.on('resize scroll', handleReziseAndScroll);

		// Data events
		// First event received off modal
		upc.once('eventsReceived', firstEvent);

		// we want to render every new events when they are recieved
//		upc.on('eventsReceived', renderEvents);

		upc.on(g.MODEL_CHANGED, modelChanged);

		return this;

	}

/* @class GridView */
var GridView = {
		initialize: initialize,
		getSelectedChannels: getSelectedChannels,
		getSelectedTime: getSelectedTime
	};

	return GridView;

});