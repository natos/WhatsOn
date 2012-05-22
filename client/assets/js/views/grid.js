/* 
* GridView 
* --------------
*
* Emitting events, UI changes
* Listen to the model for data changes
* 
* IMPORTANT: This component calculates the dimensions of the grid
* based on the size of other elements on the page (e.g. the channel bar)
* that are only sized correctly is the CSS is loaded already. If the CSS
* is not yet loaded, the grid dimensions will be calculated incorrectly.
*
* Because of cross-browser loading issues, requireJS cannot reliably detect
* when a CSS file has finished loading -- see http://requirejs.org/docs/faq-advanced.html#css
* This means that the relevant CSS must be injected into the <head> of the
* page when the original page is first rendered.
*
*/

define([

	'config/app',
	'config/grid',
	'modules/app',
	'components/timebar',
	'components/channelbar',
	'components/buffer',
	'utils/convert'

], function GridViewScope(a, g, App, TimeBar, ChannelBar, Buffer, convert) {

	var executionTimer;
	var $window = $(window);

	/**
	 * Load the content for the view.
	 * Activate associated components.
	 * Set up event handlers.
	 * @public
	 */
	function initialize() {

		if ($('#content').find('#grid-container').length>0) {
			// Grid container is already loaded
			initializeComponents();
		} else {
			// Get grid container from server
			$('#content').load('/grid #content', function(data, status, xhr){
				initializeComponents();
			});
		}

		g.END = new Date(g.ZERO.valueOf() + 24*60*60*1000);

		// UI event handlers
		// every time user scrolls, we want to load new events
		$window.on('resize scroll', handleResizeAndScroll);

		// Data events
		// we want to render every new events when they are recieved
 		App.on('eventsReceived', renderEvents);
		App.on(g.MODEL_CHANGED, modelChanged);

		App.emit(a.VIEW_LOADED, 'grid');

		return this;

	};

	/**
	 * Activate sub-components of the view
	 * @private
	 */
	function initializeComponents() {
		this.components = {
			timebar		: TimeBar.initialize(),
			channelbar	: ChannelBar.initialize(),
			buffer		: Buffer.initialize()
		};

		// Grid styles depend on the components being initialized.
		// todo: bad dependency - try to remove.
		appendCSSBlock('grid-styles', defineStyles());

		// Start the first data load
		App.emit(g.GRID_MOVED);
		App.emit(g.GRID_FETCH_EVENTS);
	};


	/**
	 * If necessary, remove the content for the view from the DOM.
	 * Deactivate associated components. 
	 * Clean up event handlers.
	 * @public
	 */
	function finalize() {

		finalizeComponents();

		$window.off('resize scroll', handleResizeAndScroll);
		App.off('eventsReceived', renderEvents);
		App.off(g.MODEL_CHANGED, modelChanged);

	};

	/**
	 * Deactivate associated components.
	 * @private
	 */
	function finalizeComponents() {
		var componentName, component;
		var components = this.components;

		for (componentName in components) {
			if (components.hasOwnProperty(componentName)) {
				component = components[componentName];
				if (typeof(components.finalize)==='function') {
					component.finalize();
				}
			}
		}
	};

	/**
	 * Handler for scrolling and resizing events.
	 * Uses an execution timer for throttling.
	 * @private
	 */
	function handleResizeAndScroll(e) {

		App.emit(g.GRID_MOVED);

		if (executionTimer) {
			clearTimeout(executionTimer);
		}

		executionTimer = setTimeout(function() {
			App.emit(g.GRID_FETCH_EVENTS);
		}, 200);

	};

	/**
	 * Handler for model data changes.
	 * @private
	 */
	function modelChanged(obj) {
		if (obj.events) {
			renderEvents(obj.events);
		}
	};

	/**
	 * Generate a block of CSS to adapt the grid to the current viewport dimensions.
	 * @private
	 */
	function defineStyles() {

		// define constants
		var $channelsbar = $('#channels-bar');
		var $timebar = $('#time-bar');
		g.TIMEBAR_HEIGHT = $timebar.height();
		g.CHANNELS_COUNT = $channelsbar.find('li').length;
		g.CHANNEL_BAR_WIDTH = $channelsbar.width();
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

	/**
	 * Render a set of EPG events into the grid.
	 * @private
	 */
	function renderEvents(events) {

		var link, description, i, event, width, left, startDateTime, endDateTime, right;

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

			// Avoid rendering events that end before 00:00 or start after 24:00
			if ( (endDateTime <= g.ZERO) || (startDateTime >= g.END) ) {
				continue;
			}

			width = convert.timeToPixels(endDateTime, startDateTime);
			left = convert.timeToPixels(startDateTime, g.ZERO);
			if (left < 0) {
				right = left + width;
				left = 0;
				width = right;
				event.programme.title = "←" + event.programme.title;
			}

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
		App.emit(g.GRID_RENDERED);

	};

	/**
	 * Determine what time window is visible in the viewport.
	 * @public
	 */
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

	/**
	 * Determine what channels are visible in the viewport.
	 * Optionally, return some channels above and below the visible
	 * channel range, for pre-loading.
	 * @public
	 */
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

		// Return N channels above and below the visible window 
		for (i = (0 - extraAboveAndBelow); i < (channelsTall + extraAboveAndBelow); i++) {
			if ( (firstChannel + i) < 0 || (firstChannel + i) >= App.channels.length ) {
				continue;
			}
			channelIds.push(App.channels[firstChannel + i].id);
		}

		return channelIds;

	};

	/**
	 * Add or update a named <style> element to the DOM.
	 * @private
	 */
	function appendCSSBlock(blockId, cssText) {
		var el = document.getElementById(blockId);
		if (el) {
			el.innerHTML = cssText;
		} else {
			el = document.createElement('style');
			el.id = blockId;
			el.innerHTML = cssText;
			document.getElementsByTagName('HEAD')[0].appendChild(el);
		}
	};


	/* @class GridView */
	return {
		initialize: initialize,
		finalize: finalize,
		getSelectedChannels: getSelectedChannels,
		getSelectedTime: getSelectedTime
	};

});