// GridView.js

define([

//	'templates/UserControlTemplate'
	'views/LayerView'
,	'js/sources/GridSource.js'
//,	'js/libs/xdate/xdate.js'
,	'js/libs/timer/timer.js'

],

function(Layer, GridSource) {

	var timer = new Timer('Grid View')
	,	requestTimer;

	return Backbone.View.extend({

		el: $('#grid-container')

	// $ shortcuts
	,   window: $(window)

	,	'time-bar': $('#time-bar')

	,	'time-bar-list': $('#time-bar').find('ol')

	,	'channels-bar': $('#channels-bar')

	,	'channels-bar-list': $('#channels-bar').find('ul')

	//	constants

	,	MAX_DOM_ELEMENTS: 500
	,	MILLISECONDS_IN_HOUR: 3600000

	//  private classes

	,	layer: new Layer()

	// 	maps

	,	eventsBuffer: []

	,	channelsOffsetMap: {}

	,	initialize: function() {

			timer.track('Initialize');

			// Now
			this.zeroTime = new Date(); // TODO: Try a framework like XDate: http://arshaw.com/xdate/

			// Constansts
			this.HOUR_WIDTH = this['time-bar'].find('li').outerWidth();
			this.ROW_HEIGHT = this['channels-bar'].find('li').outerHeight();

			// Map Channel ID / OffsetTop
			for (var i = 0; i < channels.length; i++) {
				this.channelsOffsetMap[ channels[i].id ] = i * this.ROW_HEIGHT;
			}

			// Create Timeline
			this.drawTimeLine();

			this.trigger('view-initialized', this);

			// self load
			this.load();
		}

	,	load: function() {

			this.scrollHandlers();

			this.clickHandlers();

			this.trigger('view-created');

			timer.track('Finish Load');

			this.getEvents();

		}

	,	unload: function() {

			this.el.html( '' );

			this.trigger('view-unloaded', this);

		}

	,	drawTimeLine: function() {

			var self = this,
				hourTime;

			// Each <li> represents one hour
			this['time-bar-list'].find('li').each(function(i, e) {
				hourTime = new Date(self.zeroTime.valueOf() + (i * (self.MILLISECONDS_IN_HOUR)));
				$(e).html('<span>' + ('0' + hourTime.getHours().toString()).slice(-2) + ':00</span>');
			});
			this.updateBars();

			timer.track('Draw Timeline');

		}

		// just a silly loader
	,	loader: function() {

			var self = this;
	
			if ( $('.loader')[0] ) {

				$('.loader').fadeOut(function(){ $(this).remove() });

			} else {

				$('<div class="loader">')
					.hide()
					.appendTo(self.el)
					.fadeIn();
			}
		}

	,	clickHandlers: function() {

			var self = this;

			wo.event.trigger('new-layer');

			var handler = function(event) {

				event.preventDefault();
				event.stopPropagation();

				if (!event.target.href) {
					self.layer.hide();
					return;
				}

				self.layer.show(event);

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

					self.getEvents();

				}, 200);

				// Update scroll bars
				self.updateBars();
			}

			this.window.bind('scroll resize touchmove', handleEvents);

			timer.track('Scroll handlers setted');

		}

	,	updateBars: function() {

			var left = this.window.scrollLeft()
			,	top = this.window.scrollTop();

			this['time-bar-list'].css( 'left', (left + Math.floor((this.HOUR_WIDTH * (this.zeroTime.getMinutes()/60)))) * -1 );
			this['channels-bar-list'].css( 'top', top * -1 );
			
		}

	,	getEvents: function() {

			// How many channels have been scrolled vertically?
			var channelsScrolledUp = this.window.scrollTop() / this.ROW_HEIGHT;
			var firstChannel = (channelsScrolledUp < 0) ? 0 : Math.floor(channelsScrolledUp);
			// How many channels tall is the screen?
			var topOffset = 100; // TODO: calculate this based on actual dimensions
			var channelsTall = (window.innerHeight - topOffset) / this.ROW_HEIGHT;

			// Calculate which channels to get
			var channelIds = [];
			for (var i = 0; i < channelsTall; i++) {
				channelIds.push(channels[firstChannel + i].id);
			}

			// How many hours have been scrolled horizontally?
			var hoursScrolledLeft = this.window.scrollLeft() / this.HOUR_WIDTH;
			// How many hours wide is the screen?
			var channelsBarWidth = 43;
			var hoursWide = (document.body.clientWidth - channelsBarWidth) / this.HOUR_WIDTH;

			// Calculate the left border time, and right border time
			var leftBorderTime = new Date(this.zeroTime.valueOf() + (hoursScrolledLeft * this.MILLISECONDS_IN_HOUR));
			var rightBorderTime = new Date(this.zeroTime.valueOf() + (hoursScrolledLeft * this.MILLISECONDS_IN_HOUR) + (hoursWide * this.MILLISECONDS_IN_HOUR));

			GridSource.getEventsForGrid(channelIds, this.zeroTime, leftBorderTime, rightBorderTime, this.renderEvent, this);
		}

	,	renderEvent: function(event) {

			var renderingTimer = new Timer('Rendering');

			var channel = event.channel;

			// find the offsettop position from this channel
			var offsetTop = this.channelsOffsetMap[ channel.id ];

			var st = event.startDateTime
			var et = event.endDateTime
			var endDateTime = new Date(et.slice(0,4), parseInt(et.slice(5,7),10) -1, parseInt(et.slice(8,10),10), parseInt(et.slice(11,13),10), parseInt(et.slice(14,16),10));
			var startDateTime = new Date(st.slice(0,4), parseInt(st.slice(5,7),10) -1, parseInt(st.slice(8,10),10), parseInt(st.slice(11,13),10), parseInt(st.slice(14,16),10));
			var duration = ( endDateTime.valueOf() - startDateTime.valueOf() ) / this.MILLISECONDS_IN_HOUR; // hours
			var width = Math.floor( duration * this.HOUR_WIDTH ); // pixels
			var offsetTime = ( startDateTime.valueOf() - this.zeroTime.valueOf() ) / this.MILLISECONDS_IN_HOUR; // hours
			var offsetTop = this.channelsOffsetMap[ channel.id ];
			var offsetLeft = Math.floor( offsetTime * this.HOUR_WIDTH ); // pixels

			// Render if the event dosen't exist on the DOM
			if ( !$('#'+event.id)[0] ) {

				if (!event.programme) {
					console.log("Warning: event.programme is an empty object");
					console.log(event);
				}

				var eventItem = $('<div>')
					.addClass('event')
					.attr('id', event.id)
					.html('<a id="' + event.programme.id + '" class="programme" href="/programme/' + event.programme.id + '.html">' + event.programme.title + '</a>' + st)
					.css({
						'position': 'absolute'
					,	'top': offsetTop + 'px'
					,	'left': offsetLeft + 'px'
					,	'width': width
					})
					.hide()
					.appendTo('#grid-container')
					.fadeIn();

				renderingTimer.track('Event ' + event.id + ' Rendered');

				// Save the eventItem to the eventsBuffer
				// To control how many elements are rendered
				this.eventsBuffer.push(eventItem);

				// Check to see if we need to remove events from the DOM
				this.checkEventsBuffer();
			}
		}

	,	checkEventsBuffer: function() {

//			requestTimer.track('Events Buffer Check');

			if (this.eventsBuffer.length > this.MAX_DOM_ELEMENTS) {

//				requestTimer.track('Events Buffer Start Cleaning');

				console.log('WARNING: ' + this.MAX_DOM_ELEMENTS + ' Events on the DOM');

				var shifted,
					erase = 100;

				while (erase--) {
					shifted = this.eventsBuffer.shift();
					shifted.remove();
					shifted = null;
				}

				// need to find a better way, while user scrolls
				// some things may desapear from his sight

//				requestTimer.track('Events Buffer Finish Cleaning');

			}

		}

	});

}); // define