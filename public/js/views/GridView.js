// GridView.js

define([

	'models/EventModel'
,	'collections/EventCollection'
,	'views/EventView'
,	'views/LayerView'
,	'views/TimeTickerView'
,	'views/TimeManualControlsView'
,	'js/sources/GridSource.js'
//,	'js/libs/xdate/xdate.js'
,	'js/libs/timer/timer.js'

],

function(EventModel, EventCollection, EventView, Layer, TimeTicker, TimeManualControls, GridSource) {

// private scope
var timer = new Timer('Grid View'), requestTimer, bufferTimer;
// end private scope

	return Backbone.View.extend({

	// $ shortcuts

		el: $('#grid-container')

	,   window: $(window)

	,	'time-bar': $('#time-bar')

	,	'time-bar-list': $('#time-bar ol')

	,	'channels-bar': $('#channels-bar')

	,	'channels-bar-list': $('#channels-bar ul')

	//	constants
	,	MAX_DOM_ELEMENTS: 500

	,	MILLISECONDS_IN_HOUR: 3600000

		// With no support of Fixed positioning use manual controls
	,	USE_MANUAL_TIME_CONTROLS: !supportsCSSFixedPosition

	,	support: {
			cssFixedPosition: supportsCSSFixedPosition,
			touch: false
		}

	//  private classes

	,	layer: new Layer()

	// 	maps

	,	viewport: {}

	,	eventsToRenderCount: 0

	,	eventsBuffer: []

	,	channelsOffsetMap: {}

	,	initialize: function() {

			timer.track('Initialize');

			// get viewport size
			this.getViewportSize();

			// Set features and capabilities, such as 
			this.initCapabilities();

			// Now
			var now = new Date();
			// Adjust the zero time so that "now" is half-way across the width of the page
			var channelsBarWidth = 43;
			var hoursWide = (this.viewport.width - channelsBarWidth) / this.HOUR_WIDTH;
			var initialOffsetHoursBetweenZeroTimeAndNow = (0.5 * hoursWide)
			this.zeroTime = new Date(now.valueOf() - (initialOffsetHoursBetweenZeroTimeAndNow * this.MILLISECONDS_IN_HOUR));

			// Ticker
			this.timeTicker = new TimeTicker(now, initialOffsetHoursBetweenZeroTimeAndNow, this.HOUR_WIDTH);

			// Time Manual Controls
			this.timeManualControls = this.USE_MANUAL_TIME_CONTROLS && new TimeManualControls();

			// Create Timeline
			this.drawTimeLine();

			// Create loading indicator
			this.initLoader();

			// Map Channel ID / OffsetTop
			for (var i = 0; i < channels.length; i++) {
				this.channelsOffsetMap[ channels[i].id ] = i * this.ROW_HEIGHT;
			}

			this.trigger('view-initialized', this);

			// self load
			this.load();
		}

	,	initCapabilities: function() {
			var supportClasses = [],
				cssText = [],
				screenArea,
				gridHeight,
				gridWidth;

			// How many days are visible? Smaller screens => fewer days
			screenArea = this.viewport.width * this.viewport.height;
			if (screenArea <= 153600) { // 320 x 480
				this.DAYS_VISIBLE = 1;
			} else if (screenArea <= 384000) { // 480 x 800
				this.DAYS_VISIBLE = 2;
			} else { // bigger than 480 x 800
				this.DAYS_VISIBLE = 3;
			}

			// TODO: Adjust hour width and row height based on screen size.
			this.HOUR_WIDTH = 200; // px
			this.ROW_HEIGHT = 60; // px

			this.CHANNELS_COUNT = $('#channels-bar li').length;
			this.CHANNEL_BAR_WIDTH = $('#channels-bar').width;

			// Add className to <html> element based on fixed-position support
			// If no fixed-position support, channel and time bars have to be repositioned after scroll/touch.
			if (!supportsCSSFixedPosition) {
				supportClasses.push('support-no-fixed-position');
			} else {
				supportClasses.push('support-fixed-position');
			}

			// Add className to <html> element based on touch event support
			// If touchscreen device, do not use :hover states and mouseover code.
			// (Note: not a perfect detection, but good enough for now.)
			if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
				this.support.touch = true;
				supportClasses.push('support-touch');
			} else {
				this.support.touch = false;
				supportClasses.push('support-no-touch');
			}

			// Size the grid
			gridHeight = this.ROW_HEIGHT * this.CHANNELS_COUNT;
			gridWidth = this.HOUR_WIDTH * this.DAYS_VISIBLE * 24;

			// Generate style rules for the heights and widths specific to the current browser
			cssText.push('#grid-container {height:' + gridHeight + 'px;width:' + gridWidth + 'px;}');
			cssText.push('#grid-container .event {height:' + this.ROW_HEIGHT + 'px;}');
			cssText.push('#channels-bar {height:' + gridHeight + 'px}');
			cssText.push('#channels-bar li {height:' + this.ROW_HEIGHT + 'px;}');
			cssText.push('#time-bar {width:' + gridWidth + 'px}');
			cssText.push('#time-bar ol {width:' + gridWidth + 'px}');
			cssText.push('#time-bar li {width:' + this.HOUR_WIDTH + 'px;}');
			this.appendAdaptiveCSS(cssText.join('\n'));

			$(document.documentElement).addClass(supportClasses.join(' '));
		}

	,	appendAdaptiveCSS: function(cssText) {
			var el = document.getElementById('adapt');
			if (el) {
				el.innerHTML = cssText;
			} else {
				el = document.createElement('style');
				el.id = 'adapt';
				el.innerHTML = cssText;
				document.getElementsByTagName('HEAD')[0].appendChild(el);
			}
		}

	,	load: function() {

			this.scrollHandlers();

			this.clickHandlers();

			this.getEvents();

			this.trigger('view-created');

			timer.track('Finish Load');

		}

	,	unload: function() {

			this.el.html( '' );

			this.trigger('view-unloaded', this);

		}

	,	getViewportSize: function() {

			var v = {
				width		: this.window.width()
			,	height		: this.window.height()
			,	top			: this.window.scrollTop()
			,	left		: this.window.scrollLeft()
			}

			this.viewport = v;

			return v;
		}

	,	drawTimeLine: function() {

			var self = this
			,	hourTime
			,	hourString
			,	timeLineHtml = '';

			// Each <li> represents one hour
			for (var i=0; i< this.DAYS_VISIBLE * 24; i++) {
				hourTime = new Date(self.zeroTime.valueOf() + (i * (self.MILLISECONDS_IN_HOUR)));
				hourString = ('0' + hourTime.getHours().toString()).slice(-2);
				timeLineHtml += '<li><span>' + hourString + ' hs</span></li>';
			}
			this['time-bar-list'].append(timeLineHtml);

			this.updateBars();

			timer.track('Draw Timeline');

		}

	,	initLoader: function() {
			this.loadingIndicator = $('<div class="loader">')
				.css({
					top:  Math.floor(this.viewport.height / 2) + 'px'
				,	left: Math.floor(this.viewport.width / 2) + 'px'
				})
				.appendTo('#content')
				.hide();
		}

	,	showLoader: function() {
			this.loadingIndicator.show();
		}

	, 	hideLoader: function() {
			this.loadingIndicator.hide();
		}

	,	checkLoader: function() {
			if (this.eventsToRenderCount > 0) {
				this.showLoader();
			} else {
				this.hideLoader();
			}
		}

	,	clickHandlers: function() {

			var self = this;

			var handler = function(event) {

				event.preventDefault();
				event.stopPropagation();

				var target = $(event.target)
				,	href;

				if ( target.hasClass('programme') ) {
					href = target.attr('href');
				}

				if ( target.hasClass('event') ) {
					href = target.find('a').attr('href');
				}
				
				if ( target.hasClass('description') ) {
					href = target.parent().find('a').attr('href');
				}

				self.layer.show(event, href);

			}

			this.el.bind('click', handler);

			timer.track('Click handler setted');

		}

	,	scrollHandlers: function(e) {
			var self = this;
	
			var executionTimer;

			var handleEvents = function(e) {

				if (executionTimer) {
					clearTimeout(executionTimer);
				}

				executionTimer = setTimeout(function() {

					self.getEvents();

					// Update Time Manual Controls Position
					// Not necesary if the device suports fixed positioning
					self.timeManualControls && self.timeManualControls.update(self.viewport);

				}, 200);

				// Update the viewport
				self.getViewportSize();

				// Update scroll bars
				self.updateBars();
			}

			this.window.bind('scroll resize', handleEvents);

			timer.track('Scroll handlers setted');

		}

	,	updateBars: function() {
			var currentScrollLeft = this.viewport.left;
			var currentScrollTop = this.viewport.top;
			this.updateTimeBar(currentScrollTop, currentScrollLeft);
			this.updateChannelsBar(currentScrollTop, currentScrollLeft);
		}

	,	updateTimeBar: function(currentScrollTop, currentScrollLeft) {
			if (supportsCSSFixedPosition) {
				this['time-bar-list'].css( 'left', (currentScrollLeft + Math.floor((this.HOUR_WIDTH * (this.zeroTime.getMinutes()/60)))) * -1 );
			} else {
				// If position:fixed is not supported, reposition the time bar so that it is still at the top of the screen
				this['time-bar'].css({'top': (currentScrollTop + 50) + 'px' });
				$('header.main').css({'top': currentScrollTop + 'px', 'left': currentScrollLeft + 'px' });
			}
		}

	,	updateChannelsBar: function(currentScrollTop, currentScrollLeft) {
			this['channels-bar-list'].css( 'top', currentScrollTop * -1 );
			// If position:fixed is not supported, reposition the channels bar so that it is still at the left of the screen
			if (!supportsCSSFixedPosition) {
				this['channels-bar'].css( 'left', currentScrollLeft + 'px' );
			}
		}

		/**
		* Set the src attribute on an array of channel logos, based on their data-src atribute.
		*/
	,	updateChannelImages: function(channelIds) {
			var i = channelIds.length
			,	imgElement;

			/* If a channel is visible in the viewport, show the channel image */
			while (i--) {
				imgElement = document.getElementById('channelImg' + channelIds[i]);
				if (imgElement) {
					if (!imgElement.getAttribute('src') && imgElement.getAttribute('data-src')) {
						imgElement.src = imgElement.getAttribute('data-src');
					}
				}
			}
		}

		/**
		* Return an array of the channel IDs that are currently visible in the viewport.
		*/
	,	getVisibleChannelIds: function(extraAboveAndBelow) {
			
			var channelsScrolledUp = this.viewport.top / this.ROW_HEIGHT // How many channels have been scrolled vertically?
			,	firstChannel = (channelsScrolledUp < 0) ? 0 : Math.floor(channelsScrolledUp)
			,	topOffset = 100 // TODO: calculate this based on actual dimensions
			,	channelsTall = (window.innerHeight - topOffset) / this.ROW_HEIGHT // How many channels tall is the screen?
			,	channelIds = []
			,	i = 0;

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
	}

	,	getEvents: function() {

			var channelIds = this.getVisibleChannelIds(1);

			// How many hours have been scrolled horizontally?
			var hoursScrolledLeft = this.viewport.left / this.HOUR_WIDTH;

			// How many hours wide is the screen?
			var channelsBarWidth = 43;
			var hoursWide = (document.body.clientWidth - channelsBarWidth) / this.HOUR_WIDTH;

			// Calculate the left border time, and right border time
			var leftBorderTime = new Date(this.zeroTime.valueOf() + (hoursScrolledLeft * this.MILLISECONDS_IN_HOUR));
			var rightBorderTime = new Date(this.zeroTime.valueOf() + (hoursScrolledLeft * this.MILLISECONDS_IN_HOUR) + (hoursWide * this.MILLISECONDS_IN_HOUR));

			// Show the channel logos for the visible channels
			this.updateChannelImages(channelIds);

			this.showLoader();
			GridSource.getEventsForGrid(channelIds, this.zeroTime, leftBorderTime, rightBorderTime, this.renderEventsCollection, this);
		}

	,	renderEventsCollection: function(eventsCollection) {
			var self = this;

			var t = new Timer('renderEventsCollectionTimer').off();
				t.track('Start rendering collection (' + eventsCollection.length + ' events)');

			this.eventsToRenderCount += eventsCollection.length;

			_.each(eventsCollection, function(event){
				setTimeout(function(){self.renderEvent(event)}, 0)
			});

			// Check to see if we need to remove events from the DOM
			this.checkEventsBuffer();

			t.track('Finish rendering collection');
		}

	,	renderEvent: function(event) {
			var renderingTimer = new Timer('Rendering').off();

			// Render if the event doesn't exist on the DOM
			if ( !document.getElementById(event.id) ) {

				var channel = event.channel,
					offsetTop = this.channelsOffsetMap[ channel.id ],
					st = event.startDateTime,
					et = event.endDateTime,
					endDateTime = new Date(et.slice(0,4), parseInt(et.slice(5,7),10) -1, parseInt(et.slice(8,10),10), parseInt(et.slice(11,13),10), parseInt(et.slice(14,16),10)),
					startDateTime = new Date(st.slice(0,4), parseInt(st.slice(5,7),10) -1, parseInt(st.slice(8,10),10), parseInt(st.slice(11,13),10), parseInt(st.slice(14,16),10)),
					duration = ( endDateTime.valueOf() - startDateTime.valueOf() ) / this.MILLISECONDS_IN_HOUR, // hours
					width = Math.floor( duration * this.HOUR_WIDTH ), // pixels
					offsetTime = ( startDateTime.valueOf() - this.zeroTime.valueOf() ) / this.MILLISECONDS_IN_HOUR, // hours
					offsetTop = this.channelsOffsetMap[ channel.id ],
					offsetLeft = Math.floor( offsetTime * this.HOUR_WIDTH ); // pixels

				if (!event.programme) {
					console.log("Warning: event.programme is an empty object");
					console.log(event);
				}

				// Create a EventModel
				// Maybe is a good idea use a Backbone Model with a Backbone Collection
				var eventModel = event;
				eventModel.dimensions = {
					top: offsetTop
				,	left: offsetLeft
				,	width: width
				}
				eventModel.gridContainer = this.el;

				// The overhead of creating a new EventView is very small
				// compared to just creating the raw DOM elements.
				var eventView = new EventView(eventModel);

				renderingTimer.track('Event ' + event.id + ' Rendered');

				// Save the eventView to the eventsBuffer
				// To control how many elements are rendered
				this.eventsBuffer.push(eventView);
			}

			this.eventsToRenderCount -= 1;

			this.checkLoader();
		}

	,	checkEventsBuffer: function() {

			if (this.eventsBuffer.length > this.MAX_DOM_ELEMENTS) {

				bufferTimer = new Timer('Events Buffer');

				bufferTimer.track('Start Cleaning');

				console.log('WARNING: ' + this.MAX_DOM_ELEMENTS + ' Events on the DOM');

				var shifted,
					erase = this.MAX_DOM_ELEMENTS;

				while (erase--) {
					shifted = this.eventsBuffer.shift();
					shifted.remove();
					shifted = null;
				}

				// need to find a better way, while user scrolls
				// some things may desapear from his sight

				bufferTimer.track('Finish Cleaning');

			}

		}

	});

}); // define