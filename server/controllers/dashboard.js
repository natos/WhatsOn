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
	'utils/metadata'

],


/**
 *	@class DashboardController
 */

function(Channel, Bookings, DateUtils, Metadata) {

	/** @constructor */

	var DashboardController = function(app) {

		_app = app;

		// Routing

		app.server.get('/', this.render);

		app.server.get('/dashboard', this.render);

	};


	/** @private */

	var _app,

		metadata = new Metadata(),

		dateUtils = new DateUtils(),

		ChannelService = new Channel(),

		BookingsService = new Bookings();


	/** @public */

	DashboardController.prototype.render = function(req, res) {

		var topbookings, render = function() {

			if (!topbookings) { return; }

			topbookings = dateUtils.prettifyCollection(topbookings, 'startDateTime');

			res.render('dashboard.jade', {
				metadata	: metadata.get(),
				config		: _app.config,
				topbookings : topbookings,
				supports	: req.supports
			});

		};

		BookingsService.once('getTopBookings', function(error, response, body) {

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