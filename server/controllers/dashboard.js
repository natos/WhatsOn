/**
 *	DashboardController
 */

define([

	/** @require */

	// services
	'services/channel',
	'services/bookings',
	'services/tvtips',

	// utils
	'utils/metadata',

	// mocks
	'mocks/channels'

],


/**
 *	@class DashboardController
 */

function(ChannelService, BookingsService, TVTipsService, Metadata, Channels) {

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

		var render = function(normalizedEvents) {

			if (!normalizedEvents) { return; }

			var template = req.xhr ? 'contents/dashboard.jade' : 'layouts/dashboard.jade'

			res.render(template, {
				metadata	: metadata.get(),
				config		: _app.config,
				normalizedEvents : normalizedEvents,
				channels	: Channels,
				supports	: req.supports
			});

		};

		var featuredEventsType = 'tvtips'; // 'tvtips' | 'topbookings'

		switch(featuredEventsType) {
			case 'tvtips':
				new TVTipsService().once('getTVTips', function(normalizedEvents) {

					render(normalizedEvents);

				}).getTVTips('nl');
				break;

			case 'topbookings': 
				new BookingsService().once('getTopBookings', function(normalizedEvents) {

					render(normalizedEvents);

				}).getTopBookings();
				break;
		}

	};


	/** @return */

	return DashboardController;

});