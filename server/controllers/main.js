/**
 *	MainController
 */

define([

	/** @require */

	// services
	'services/channel',
	'services/bookings',

	// utils
	'utils/dateutils',
	'utils/metadata'

],


/**
 *	@class MainController
 */

function(Channel, Bookings, DateUtils, Metadata) {

	/** @constructor */

	var MainController = function(app) {

		_app = app;

		// Routing

		app.server.get('/', this.render);
	};


	/** @private */

	var _app,

		metadata = new Metadata(),

		dateUtils = new DateUtils(),

		ChannelService = new Channel(),

		BookingsService = new Bookings();


	/** @public */

	MainController.prototype.render = function(req, res) {

		var topbookings, channels, render = function() {

			if (!topbookings||!channels) { return; }

			topbookings = dateUtils.prettifyCollection(topbookings, 'startDateTime');

			res.render('main.jade', {
				metadata	: metadata.get(),
				supports	: req.supports,
				config		: _app.config,
				topbookings : topbookings,
				channels 	: channels,
				timebar		: new Array(24),
			});

		};

		ChannelService.once('getChannels', function(_channels) {
			channels = _channels;
			render();
		}).getChannels();

		BookingsService.once('getTopBookings', function(error, response, body) {

			topbookings = JSON.parse(body);

			// Weird, every event comes wrapped whitin an array (??)
			// this is just for unwrap the event;
			topbookings = (function() {	var events = []; topbookings.forEach(function(e, i) { events.push(e[0]); }); return events; }());

			render();

		}).getTopBookings();

	};


	/** @return */

	return MainController;

});