/**
 *	DashboardController
 */

define([

	/** @require */

	// services
	'services/channel',
	'services/bookings',
	'services/tvtips',
	'services/bookings',
	'services/nowandnext',

	// utils
	'utils/metadata'

],


/**
 *	@class DashboardController
 */

function(ChannelService, BookingsService, TVTipsService, TopBookingsService, NowAndNextService, Metadata) {

	/** @constructor */

	var DashboardController = function(app) {

		_app = app;

		// Routing

		app.server.get('/dashboard', this.render);

	};


	/** @private */

	var _app,

		metadata = new Metadata();

	/** @public */

	DashboardController.prototype.render = function(req, res) {

		var render = function(tvTipsEvents, topBookingsEvents, eventsOnPopularChannelsRightNow) {

			if (!tvTipsEvents) { return; }

			var template = req.xhr ? 'contents/dashboard.jade' : 'layouts/dashboard.jade'

			var channelsMap = {};
			_app.channels.forEach(function(el, ix, arr){channelsMap[el.id] = el});

			res.render(template, {
				metadata	: metadata.get(),
				config		: _app.config,
				channels	: _app.channels,
				channelsMap : channelsMap,
				tvTipsEvents : tvTipsEvents,
				topBookingsEvents : topBookingsEvents,
				eventsOnPopularChannelsRightNow : eventsOnPopularChannelsRightNow,
				supports	: req.supports,
				xhr			: req.xhr
			});

		};

		(new TVTipsService()).once('getTVTips', function(tvTipsEvents) {
			(new TopBookingsService()).once('getTopBookings', function(topBookingsEvents) {
				(new ChannelService()).once('getPopularChannelIds', function(popularChannelIds){

					var nowTime = new Date();
					var nowTimeValue = nowTime.valueOf();

					(new NowAndNextService()).once('getNowAndNext', function(popularChannels, channelEventsCollection){

						var channelsCount = popularChannels.length;
						var eventsOnPopularChannelsRightNow = [];
						var i, channel, event, item, startTimeValue, endTimeValue;

						// TODO: HANDLE TIME ZONES!!!

						for (i=0; i<channelsCount; i++) {
							item = channelEventsCollection[i];
							if (item.channelEvents && item.channelEvents.length > 0) {
								channel = item.channel;
								event = item.channelEvents[0];
								startTime = new Date(event.startDateTime); // UTC
								startTimeValue = startTime.valueOf();
								endTime = new Date(event.endDateTime); // UTC
								endTimeValue = endTime.valueOf();
								event.startTimeString = ('00' + startTime.getHours().toString()).slice(-2) + ':' + ('00' + startTime.getMinutes().toString()).slice(-2); // Local time FOR THE WEB SERVER
								event.endTimeString = ('00' + endTime.getHours().toString()).slice(-2) + ':' + ('00' + endTime.getMinutes().toString()).slice(-2); // Local time FOR THE WEB SERVER
								event.percentageComplete = (100 * (nowTimeValue - startTimeValue)) / (endTimeValue - startTimeValue);
								event.channel = {
									id: channel.id,
									name: channel.name,
									logoImg: channel.logoIMG
								}
								event.nextEvent = item.channelEvents[1];

								eventsOnPopularChannelsRightNow.push(event);
							}
						}

						topBookingsEvents.forEach(function(el, ix, arr){
							startTime = new Date(el.startDateTime); // UTC
							endTime = new Date(el.endDateTime); // UTC
							el.startTimeString = ('00' + startTime.getHours().toString()).slice(-2) + ':' + ('00' + startTime.getMinutes().toString()).slice(-2); // Local time FOR THE WEB SERVER
							el.endTimeString = ('00' + endTime.getHours().toString()).slice(-2) + ':' + ('00' + endTime.getMinutes().toString()).slice(-2); // Local time FOR THE WEB SERVER
						});

						render(tvTipsEvents, topBookingsEvents, eventsOnPopularChannelsRightNow);

					}).getNowAndNext(nowTime, popularChannelIds, true)
				}).getPopularChannelIds();
			}).getTopBookings('nl');
		}).getTVTips('nl');

	};


	/** @return */

	return DashboardController;

});