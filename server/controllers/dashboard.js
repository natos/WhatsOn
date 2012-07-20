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
		app.server.get('/dashboard/on-now/:channelIds', this.renderOnNow);

	};


	/** @private */

	var _app,

		metadata = new Metadata(),

		weekdays = {
			'nl' : ['Zondag','Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag','Zaterdag'],
			'en' : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
		};

	// Knuth-Fisher-Yates shuffle, via _underscore.js
	var shuffleArray = function(arr) {
		var rand;
		var index = 0;
		var shuffled = [];
		arr.forEach(function(el){
			rand = Math.floor(Math.random() * ++index);
			shuffled[index - 1] = shuffled[rand];
			shuffled[rand] = el;
		});
		return shuffled;
	}

	// Turn an event's (optional) category / subcategory information into a simple string
	var getCategoryString = function(event) {
		var categoryString = "";
		var subcategory, categoryName, subcategoryName;
		var programme = event.programme;

		if (programme && programme.subcategory) {
			subcategory = programme.subcategory;
			subcategoryName = subcategory.name;
			if (subcategory.category) {
				categoryName = subcategory.category.name;
			}
		}

		if (categoryName) {
			if (categoryName === subcategoryName) {
				categoryString = categoryName;
			} else {
				categoryString = categoryName + ' (' + subcategoryName + ')';
			}
		} else {
			categoryString = subcategoryName;
		}

		return categoryString;
	}

	// Take a set of events returned from the now&next service, and normalize them 
	// so they can be passed on to an on-now template.
	var normalizeOnNowEvents = function(channelEventsCollection, nowTime) {
		var onNowEvents = [];
		var nowTimeValue = nowTime.valueOf();
		var channelsCount = channelEventsCollection.length;
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
				event.categoryString = getCategoryString(event);
				event.channel = {
					id: channel.id,
					name: channel.name,
					logoImg: channel.logoIMG
				}
				event.nextEvent = item.channelEvents[1];

				onNowEvents.push(event);
			}
		}

		return onNowEvents;
	}

	// Take a set of events returned from the top bookings service, and normalize them
	// with the properties required for the topbookings template
	var normalizeTopBookingsEvents = function(topBookingsEvents) {
		topBookingsEvents.forEach(function(el, ix, arr){
			var startTime = new Date(el.startDateTime); // UTC
			var endTime = new Date(el.endDateTime); // UTC
			el.startTime = startTime;
			el.endTime = endTime;
			el.startTimeString = weekdays['nl'][startTime.getDay()] + ' ' + ('00' + startTime.getHours().toString()).slice(-2) + ':' + ('00' + startTime.getMinutes().toString()).slice(-2); // Local time FOR THE WEB SERVER
			el.endTimeString = ('00' + endTime.getHours().toString()).slice(-2) + ':' + ('00' + endTime.getMinutes().toString()).slice(-2); // Local time FOR THE WEB SERVER
		});
		return topBookingsEvents;
	}

	// Return the hh:mm component of the specified datetime, as a string
	var getTimeAsString = function(dt) {
		return ('00' + dt.getHours().toString()).slice(-2) + ':' + ('00' + dt.getMinutes().toString()).slice(-2);
	}

	/** @public */

	DashboardController.prototype.renderOnNow = function(req, res) {

		var channelIds = (req.params.channelIds || '').split('|');
		var nowTime = new Date();

		(new NowAndNextService()).once('getNowAndNext', function(channelIds, channelEventsCollection) {

			var nowString = getTimeAsString(nowTime);
			var onNowEvents = normalizeOnNowEvents(channelEventsCollection, nowTime);

			res.render('components/favorite-channels-on-now.jade', {
				nowString : nowString,
				onNowEvents : onNowEvents
			});

		}).getNowAndNext(nowTime, channelIds, true)


	}

	DashboardController.prototype.render = function(req, res) {

		var nowTime = new Date();

		var render = function(tvTipsEvents, topBookingsEvents, eventsOnPopularChannelsRightNow) {

			if (!tvTipsEvents) { return; }

			var template = req.xhr ? 'contents/dashboard.jade' : 'layouts/dashboard.jade'

			var channelsMap = {};
			_app.channels.forEach(function(el, ix, arr){channelsMap[el.id] = el});

			var nowString = getTimeAsString(nowTime);

			res.render(template, {
				metadata	: metadata.get(),
				config		: _app.config,
				channels	: _app.channels,
				channelsMap : channelsMap,
				tvTipsEvents : shuffleArray(tvTipsEvents),
				topBookingsEvents : topBookingsEvents,
				eventsOnPopularChannelsRightNow : eventsOnPopularChannelsRightNow,
				nowString : nowString,
				supports	: req.supports,
				xhr			: req.xhr
			});

		};

		(new TVTipsService()).once('getTVTips', function(tvTipsEvents) {
			(new TopBookingsService()).once('getTopBookings', function(topBookingsEvents) {
				(new ChannelService()).once('getPopularChannelIds', function(popularChannelIds){
					(new NowAndNextService()).once('getNowAndNext', function(popularChannels, channelEventsCollection) {

						var eventsOnPopularChannelsRightNow = normalizeOnNowEvents(channelEventsCollection, nowTime);

						topBookingsEvents = normalizeTopBookingsEvents(topBookingsEvents);

						// Sort top bookings by start time
						topBookingsEvents = topBookingsEvents.sort(function(a,b){return a.startTime.valueOf() - b.startTime.valueOf();});

						render(tvTipsEvents, topBookingsEvents, eventsOnPopularChannelsRightNow);

					}).getNowAndNext(nowTime, popularChannelIds, true)
				}).getPopularChannelIds();
			}).getTopBookings('nl');
		}).getTVTips('nl');

	};


	/** @return */

	return DashboardController;

});