/**
 *	DashboardController
 */

define([

	/** @require */

	// services
	'services/channel',
	'services/bookings',

	// utils
	'utils/dateutils',
	'utils/metadata',

	// mocks
	'mocks/channels'

],


/**
 *	@class DashboardController
 */

function(ChannelService, BookingsService, DateUtils, Metadata, Channels) {

	/** @constructor */

	var DashboardController = function(app) {

		_app = app;

		// Routing

		app.server.get('/dashboard', this.render);

	};


	/** @private */

	var _app,

		metadata = new Metadata(),

		dateUtils = new DateUtils();

	/** @public */

	DashboardController.prototype.render = function(req, res) {

		var topbookings, render = function() {

			if (!topbookings) { return; }

			// Prettify dates
			function prettifyCollection(event) { event.prettyDate = dateUtils.prettify(event['startDateTime']); };

			topbookings.map(prettifyCollection);

			var template = req.xhr ? 'contents/dashboard.jade' : 'layouts/dashboard.jade'

			res.render(template, {
				metadata	: metadata.get(),
				config		: _app.config,
				topbookings : topbookings,
				channels	: Channels,
				supports	: req.supports
			});

		};

		new BookingsService().once('getTopBookings', function(error, response, body) {

			topbookings = JSON.parse(body);

			// Weird, every event comes wrapped whitin an array (??)
			// this is just for unwrap the event;
			topbookings = (function() {	var events = []; topbookings.forEach(function(e, i) { events.push(e[0]); }); return events; }());

			render();

		}).getTopBookings();

	};


	/** @return */

	return DashboardController;

});