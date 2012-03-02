// GridView.js

define([

	'views/EventView'
,	'views/LayerView'
,	'views/TimeTickerView'
,	'views/TimeManualControlsView'
,	'js/sources/GridSource.js'
//,	'js/libs/xdate/xdate.js'
,	'js/libs/timer/timer.js'

],

function(EventView, Layer, TimeTicker, TimeManualControls, GridSource) {

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

	,	USE_MANUAL_TIME_CONTROLS: !supportsCSSFixedPosition // With no support of Fixed positioning use manual controls

	//  private classes

	,	layer: new Layer()

	// 	maps

	,	viewport: {}

	,	eventsBuffer: []

	,	channelsOffsetMap: {}

	,	initialize: function() {

			timer.track('Initialize');

			// Constansts
			this.HOUR_WIDTH = this['time-bar'].find('li').outerWidth();
			this.ROW_HEIGHT = this['channels-bar'].find('li').outerHeight();

			// Now
			this.zeroTime = new Date(); // TODO: Try a framework like XDate: http://arshaw.com/xdate/

			// Ticker
			this.timeTicker = new TimeTicker(this.zeroTime);

			// Time Manual Constrols
			this.timeManualControls = this.USE_MANUAL_TIME_CONTROLS && new TimeManualControls();

			// get viewport size
			this.getViewportSize();

			// Create Timeline
			this.drawTimeLine();

			// Map Channel ID / OffsetTop
			for (var i = 0; i < channels.length; i++) {
				this.channelsOffsetMap[ channels[i].id ] = i * this.ROW_HEIGHT;
			}

			this.trigger('view-initialized', this);

			// self load
			this.load();
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
			,	hourString;

			// Each <li> represents one hour
			this['time-bar-list'].find('li').each(function(i, e) {
				hourTime = new Date(self.zeroTime.valueOf() + (i * (self.MILLISECONDS_IN_HOUR)));
				hourString = ('0' + hourTime.getHours().toString()).slice(-2);
				$(e).html('<span>' + hourString + ' hs</span><div class="spike"></div>');
			});
			this.updateBars();

			timer.track('Draw Timeline');

		}

		// just a silly loader
	,	loader: function() {

			var self = this;

			if ( $('.loader')[0] ) {

				$('.loader').fadeOut('fast', function(){ $(this).remove() });

			} else {

				$('<div class="loader">')
					.hide()
					.css({
						top:  Math.floor(self.viewport.height / 2) + 'px'
					,	left: Math.floor(self.viewport.width / 2) + 'px'
					})
					.appendTo('#content')
					.fadeIn('fast');
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

	,	scrollHandlers: function() {

			var self = this;
	
			var executionTimer;

			var handleEvents = function() {

				if (executionTimer) {
					clearTimeout(executionTimer);
				}

				executionTimer = setTimeout(function() {

					self.loader();
					self.getViewportSize();
					self.getEvents();

					// Update Time Manual Controls Position
					// Not necesary if the device suports fixed positioning
					// Need to improve sniffing
					//if (self.USE_MANUAL_TIME_CONTROLS) {
					//	self.timeManualControls.update(self.viewport);
					//}
					self.timeManualControls && self.timeManualControls.update(self.viewport);

				}, 200);

				// Update scroll bars
				self.updateBars();
			}

			this.window.bind('scroll resize touchmove', handleEvents);

			timer.track('Scroll handlers setted');

		}

	,	updateBars: function() {

			var left = this.window.scrollLeft()
			,	top = this.window.scrollTop()
			,	visibleChannelIds = this.getVisibleChannelIds()
			,	i = visibleChannelIds.length
			,	imgElement;


			this['time-bar-list'].css( 'left', (left + Math.floor((this.HOUR_WIDTH * (this.zeroTime.getMinutes()/60)))) * -1 );
			this['channels-bar-list'].css( 'top', top * -1 );

			/* If a channel is visible in the viewport, show the channel image */
			while (i--) {
				imgElement = document.getElementById('channelImg' + visibleChannelIds[i]);
				if (imgElement) {
					if (!imgElement.getAttribute('src') && imgElement.getAttribute('data-src')) {
						imgElement.src = imgElement.getAttribute('data-src');
					}
				}
			}
		}

		/**
		* Return an array of the channel IDs that are currently visible in the viewport
		*/
	,	getVisibleChannelIds: function(extraAboveAndBelow) {
			
			var channelsScrolledUp = this.window.scrollTop() / this.ROW_HEIGHT // How many channels have been scrolled vertically?
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
				if ((firstChannel + i) < 0) {
					continue;
				}
				channelIds.push(channels[firstChannel + i].id);
			}

			return channelIds;
	}

	,	getEvents: function() {

			var channelIds = this.getVisibleChannelIds(1);

			// How many hours have been scrolled horizontally?
			var hoursScrolledLeft = this.window.scrollLeft() / this.HOUR_WIDTH;
			// How many hours wide is the screen?
			var channelsBarWidth = 43;
			var hoursWide = (document.body.clientWidth - channelsBarWidth) / this.HOUR_WIDTH;

			// Calculate the left border time, and right border time
			var leftBorderTime = new Date(this.zeroTime.valueOf() + (hoursScrolledLeft * this.MILLISECONDS_IN_HOUR));
			var rightBorderTime = new Date(this.zeroTime.valueOf() + (hoursScrolledLeft * this.MILLISECONDS_IN_HOUR) + (hoursWide * this.MILLISECONDS_IN_HOUR));

			GridSource.getEventsForGrid(channelIds, this.zeroTime, leftBorderTime, rightBorderTime, this.renderEventsCollection, this);
		}

	,	renderEventsCollection: function(eventsCollection) {
			var self = this;

			var t = new Timer('renderEventsCollectionTimer');
			t.track('Start rendering collection (' + eventsCollection.length + ' events)');

			this.loader();

			$(eventsCollection).each(function(i, event){
				setTimeout(function(){self.renderEvent(event)}, 0)
			});

			// Check to see if we need to remove events from the DOM
			this.checkEventsBuffer();

			t.track('Finish rendering collection');
		}

	,	renderEvent: function(event) {
			var renderingTimer = new Timer('Rendering').off();

			// Render if the event dosen't exist on the DOM
			if ( !$('#'+event.id)[0] ) {

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
					eventModel.duration = duration;
					eventModel.width = width;
					eventModel.offset = {
						top: offsetTop
					,	left: offsetLeft
					}

				// new EventView
				var eventItem = new EventView(eventModel); // This might degrade performance a little bit

/*				var eventItem = $('<div>')
					.addClass('event')
					.attr('id', event.id)
					.html('<a id="' + event.programme.id + '" class="programme" href="/programme/' + event.programme.id + '.html">' + event.programme.title + '</a>' + '<p>' + event.programme.shortDescription + '</p>')
					.css({
						'position': 'absolute'
					,	'top': offsetTop + 'px'
					,	'left': offsetLeft + 'px'
					,	'width': width
					})
					.hide()
					.appendTo('#grid-container')
					.fadeIn();
*/
				renderingTimer.track('Event ' + event.id + ' Rendered');

				// Save the eventItem to the eventsBuffer
				// To control how many elements are rendered
				this.eventsBuffer.push(eventItem);
			}
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