// GridView.js

define([

//	'templates/UserControlTemplate'

],

function() {

	return Backbone.View.extend({

		el: $('#grid-container')

	,   window: $(window)

	,	'time-bar': $('#time-bar')

	,	'channels-bar': $('#channels-bar')

//	,	template: _.template( template )

	,	initialize: function() {

			this.zeroTime = new Date();

			this.channelsOffsetMap = {};
			
			for (var i = 0; i < channels.length; i++) {

				this.channelsOffsetMap[ channels[i].id ] = i * 60;

			}

			this.trigger('view-initialized', this);

			// self load
			this.load();
		}

	,	load: function() {

			this.drawTimeLine();

			this.scrollHandlers();

			this.trigger('view-created');

		}

	,	unload: function() {

			this.el.html( '' );

			this.trigger('view-unloaded', this);

		}

	,	drawTimeLine: function() {

			var now = new Date()
			,	$tb = this['time-bar'];

			//$tb.html( now.toString() );
	
		}

	,	changing: false

	,	scrollHandlers: function() {

			var self = this;
	
			var executionTimer;

			var handle = function() {

				if (executionTimer) {
					clearTimeout(executionTimer);
				}

				executionTimer = setTimeout(function(){

					self.getEvents();

				}, 100);

				// Update scroll bars
				self.updateBars();

			}

			this.window.bind('scroll resize touchmove', handle);

		}

	,	updateBars: function() {

			var timebar = this['time-bar'].find('ol')
			,	channelsbar = this['channels-bar'].find('ul')
			,	left = this.window.scrollLeft()
			,	top = this.window.scrollTop();

			timebar.css( 'left' , left * -1 );
			channelsbar.css( 'top', top * -1 );
			
		}

	,	viewport: (function() {	

			var width = 0
			, 	height = 0;

			var getSize = function() {
				height = $(window).height();
				width = $(window).width();
			}

			$(window).bind('resize', getSize); // not working

			getSize();
			
			return {
				width: width
			,	height: height
			}

		})()

	,	getEvents: function() {

			// hours visible
			var start_time = this.window.scrollLeft() / 200; // divided by hour width

				start_time = start_time * 3600000; // milisecons

			var t = new Date((this.zeroTime.valueOf() + start_time));

			var time = t.toISOString().slice(0,16) + 'Z'; // We need to improve this thing

			// channels visible
			var first_channel = this.window.scrollTop() / 60 ; // divided by channel height
				first_channel = (first_channel < 0) ? 0 : first_channel;
				first_channel = Math.floor(first_channel);

			var channels_to_get = channels[first_channel].id;

			for (var i = 1; i < 5; i++) {
				channels_to_get += '|' + channels[first_channel+i].id;
			}

			// request
			// http://tvgids.upc.nl/cgi-bin/WebObjects/EPGApi.woa/api/Channel/7K%7C7L%7C7U/events/NowAndNext_2012-02-19T15:32Z.json?batchSize=20
			var request = 'http://tvgids.upc.nl/cgi-bin/WebObjects/EPGApi.woa/api/Channel/' + channels_to_get + '/events/NowAndNext_' + time + '.json?batchSize=20&callback=?';

			var self = this;

			console.log(request);

			$.getJSON(request, function(response){
				self.renderEvents(response);
			});
		}

	,	renderEvents: function(response) {

			console.log(response);

			var self = this;

			$(response).each(function(i, eventsCollection) {
				// find the channel
				var channel = eventsCollection[0].channel;
				// find the offsettop position from this channel
				var offsetTop = self.channelsOffsetMap[ channel.id ]

				$(eventsCollection).each(function(a, event){

					var st = event.startDateTime

					var et = event.endDateTime

					var endDateTime = new Date(et.slice(0,4), parseInt(et.slice(5,7),10) -1, parseInt(et.slice(8,10),10), parseInt(et.slice(11,13),10), parseInt(et.slice(14,16),10));

					var startDateTime = new Date(st.slice(0,4), parseInt(st.slice(5,7),10) -1, parseInt(st.slice(8,10),10), parseInt(st.slice(11,13),10), parseInt(st.slice(14,16),10));

					var duration = ( endDateTime.valueOf() - startDateTime.valueOf() ) / 3600000; // hours

					var width = Math.floor( duration * 200 ); // pixels

					var timeOffset = ( startDateTime.valueOf() - self.zeroTime.valueOf() ) / 3600000; // hours

					var leftOffset = Math.floor( timeOffset * 200 ); // pixels

					if ( !$('#'+event.id)[0] ) {

						if (!event.programme) {
							console.log(event)
						}

						$('<div>')
							.addClass('event')
							.attr('id', event.id)
							.html( event.programme.title )
							.appendTo('#grid-container')
							.css({'top': offsetTop, 'position': 'absolute', 'width': width, 'left': leftOffset + 'px' });

					}

				});

/*				if ( !$('#'+channel.id)[0] ) {
					$('<div>')
						.attr('id', channel.id)
						.html(channel.name)
						.appendTo('#grid-container')
						.css({'top': offsetTop, 'position': 'absolute'});
				}*/
			});
			
		}


	});

}); // define