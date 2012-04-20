// GridView.js

define([

	'models/EventModel'
,	'collections/EventCollection'
,	'views/EventView'
,	'views/LayerView'
,	'js/sources/GridSource.js'
//,	'js/libs/xdate/xdate.js'
,	'js/libs/timer/timer.js'

],

function(EventModel, EventCollection, EventView, Layer, GridSource) {

// private scope
var timer = new Timer('Grid View'), requestTimer, bufferTimer;
var API_PREFIX = $('head').attr('data-api');
// end private scope

	return Backbone.View.extend({

	// $ shortcuts

		el: $('#grid-container')

	,   window: $(window)

	,	'header-bar': $('header.main')

	,	'time-bar': $('#time-bar')

	,	'time-bar-list': $('#time-bar ol')

	,	'channels-bar': $('#channels-bar')

	,	'channels-bar-list': $('#channels-bar ul')

	//	constants
	,	MILLISECONDS_IN_HOUR: 3600000

	//  private classes

	,	layer: new Layer()

	// 	maps

	,	viewport: {}

	,	eventsToRenderCount: 0

	,	channelsOffsetMap: {}

	,	initialize: function() {

			timer.track('Initialize');

			// get viewport size
			this.getViewportSize();

			// Now
			var now = new Date();

			this.zeroTime = new Date(now.valueOf());

			this.trigger('view-initialized', this);

			// self load
			this.load();
		}

	,	load: function() {
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

	,	getEvents: function() {

			var channelIds = [];
			for (var i=0; i< 10; i++) {
				channelIds.push(channels[i].id);
			};

			// 3-hour window from now
			var leftBorderTime = new Date(this.zeroTime.valueOf());
			var rightBorderTime = new Date(this.zeroTime.valueOf() + (3 * this.MILLISECONDS_IN_HOUR));

			GridSource.getEventsForGrid(channelIds, this.zeroTime, leftBorderTime, rightBorderTime, this.renderEventsCollection, this);
		}

		// Events for a single channel
	,	renderEventsCollection: function(eventsCollection) {
			var self = this;

			this.eventsToRenderCount += eventsCollection.length;

			var channelId = eventsCollection[0].channel.id;
			var html = '<ul>';
			var zeroTime = self.zeroTime;
			var boundaryTime = new Date(zeroTime.valueOf() + (3*60*60*1000));

			_.each(eventsCollection, function(event){
				var st = event.startDateTime,
					et = event.endDateTime,
					endDateTime = new Date(et.slice(0,4), parseInt(et.slice(5,7),10) -1, parseInt(et.slice(8,10),10), parseInt(et.slice(11,13),10), parseInt(et.slice(14,16),10)),
					startDateTime = new Date(st.slice(0,4), parseInt(st.slice(5,7),10) -1, parseInt(st.slice(8,10),10), parseInt(st.slice(11,13),10), parseInt(st.slice(14,16),10));
				if (startDateTime < boundaryTime) {
					html += '<li class="channels-list-channel__programme">';
					html += '<div class="channels-list-channel__programme-time">' + event.startDateTime.slice(11,13) + ':' + event.startDateTime.slice(14,16) + '-' + event.endDateTime.slice(11,13) + ':' + event.endDateTime.slice(14,16) + '</div>';
					html += '<div class="channels-list-channel__programme-title">' + event.programme.title + '</div>';
					html += '<div class="channels-list-channel__programme-desc">' + event.programme.shortDescription + '</div>';
					html += '</li>';
				}
			});

			document.getElementById('channels-list_channel_' + channelId + '__programmes').innerHTML = html;
			var timewindow = zeroTime.getHours() + ':' + ("00" + zeroTime.getMinutes()).slice(-2) + ' - ' + boundaryTime.getHours() + ':' + ("00" + boundaryTime.getMinutes()).slice(-2);
			document.getElementById('channels-list_channel_' + channelId + '__timewindow').innerHTML = timewindow;

		}


	});

}); // define