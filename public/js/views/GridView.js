// GridView.js

define([

//	'templates/UserControlTemplate'
	'views/LayerView'

//,	'js/libs/xdate/xdate.js'
,	'js/libs/timer/timer.js'

],

function(Layer) {

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

		}

	,	unload: function() {

			this.el.html( '' );

			this.trigger('view-unloaded', this);

		}

	,	drawTimeLine: function() {

			var self = this;
			
			var now = new Date();

			var hour = now.getHours();

			this['time-bar-list'].find('li').each(function(i, e) {

				if ( ( hour + i ) > 23 ) {
					now = new Date( now.valueOf() + 86400000 );
					hour = now.getHours();
				}

				hour = hour + i;

				$(e).html('<span>' + hour%24 + '</span>'); // FIX THIS!!!

			});

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

			this['time-bar-list'].css( 'left', left * -1 );
			this['channels-bar-list'].css( 'top', top * -1 );
			
		}

	,	getEvents: function() {

			requestTimer = new Timer('Grid View Request');

			var self = this;

			// loader feedback
			this.loader();

			// hours visible
			var start_time = this.window.scrollLeft() / this.HOUR_WIDTH; // divided by hour width
				start_time = start_time * 3600000; // milisecons

			// We need to improve this thing
			var time = new Date((this.zeroTime.valueOf() + start_time)).toISOString().slice(0,16) + 'Z'; 

			// channels visible
			var first_channel = this.window.scrollTop() / this.ROW_HEIGHT ; // divided by channel height
				first_channel = (first_channel < 0) ? 0 : Math.floor(first_channel);

			var channels_to_get = channels[first_channel].id;

			for (var i = 1; i < 5; i++) { // start from 1 because we already got the first channel
				channels_to_get += '|' + channels[first_channel+i].id;
			}

			// request
			// http://tvgids.upc.nl/cgi-bin/WebObjects/EPGApi.woa/api/Channel/7K%7C7L%7C7U/events/NowAndNext_2012-02-19T15:32Z.json?batchSize=20
			var request = 'http://tvgids.upc.nl/cgi-bin/WebObjects/EPGApi.woa/api/Channel/' + channels_to_get + '/events/NowAndNext_' + time + '.json?batchSize=10&callback=?';

			console.log(request)

			$.getJSON(request, function(response) {
				self.renderEvents(response);
			});

			requestTimer.track('New Events Request >');
		}

	,	renderEvents: function(response) {

			var self = this;

			// loader feedback
			this.loader();

			requestTimer.track('New Events Response <');

			var renderingTimer = new Timer('Rendering');

			$(response).each(function(i, eventsCollection) {

				if ( /* Object.prototype.toString.call(eventsCollection) === "[object Array]" && */ !eventsCollection.length ) {
					console.log("Warning: eventCollection is an empty array");
					console.log(response);
					return;
				}

				// find the channel
				var channel = eventsCollection[0].channel;

				// find the offsettop position from this channel
				var offsetTop = self.channelsOffsetMap[ channel.id ];

				$(eventsCollection).each(function(a, event){

					var st = event.startDateTime

					var et = event.endDateTime

					var endDateTime = new Date(et.slice(0,4), parseInt(et.slice(5,7),10) -1, parseInt(et.slice(8,10),10), parseInt(et.slice(11,13),10), parseInt(et.slice(14,16),10));

					var startDateTime = new Date(st.slice(0,4), parseInt(st.slice(5,7),10) -1, parseInt(st.slice(8,10),10), parseInt(st.slice(11,13),10), parseInt(st.slice(14,16),10));

					var duration = ( endDateTime.valueOf() - startDateTime.valueOf() ) / 3600000; // hours

					var width = Math.floor( duration * self.HOUR_WIDTH ); // pixels

					var offsetTime = ( startDateTime.valueOf() - self.zeroTime.valueOf() ) / 3600000; // hours

//					console.log(startDateTime);
//					console.log(offsetTime);

					var offsetLeft = Math.floor( offsetTime * self.HOUR_WIDTH ); // pixels

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
						self.eventsBuffer.push(eventItem);

					}

				}); // End each eventCollection

			}); // End each response

			requestTimer.track('New Events Rendered');

			// Check the amount of eventItems on the DOM
			this.checkEventsBuffer();
	
		}

	,	checkEventsBuffer: function() {

			requestTimer.track('Events Buffer Check');

			if (this.eventsBuffer.length > this.MAX_DOM_ELEMENTS) {

				requestTimer.track('Events Buffer Start Cleaning');

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

				requestTimer.track('Events Buffer Finish Cleaning');

			}

		}

	});

}); // define