/**
 *	AdminController
 */

define([

	/** @require */

	// services
	'services/bookings',
	'services/tvtips',
	'services/channel',

	// utils
	'utils/dateutils'

],


/**
 *	@class AdminController
 */

function(BookingsService, TVTipsService, ChannelService, DateUtils) {

	/** @constructor */

	var AdminController = function(app) {

		_app = app;

		// Routing

		app.server.get('/admin/topbookings', this.renderTopBookings);
		app.server.get('/admin/tvtips', this.renderTVTips);
		app.server.get('/admin/popularchannels', this.renderPopularChannels);
	};


	/** @private */

	var _app,

		dateUtils = new DateUtils();

	/** @public */

	AdminController.prototype.renderTopBookings = function(req, res) {

		var render = function(topBookings) {

			if (!topBookings) { return; }

			res.render('layouts/admin/topbookings.jade', {
				topBookings : topBookings
			});

		};

		new BookingsService().once('getTopBookings', function(topBookings) {

			render(topBookings);

		}).getTopBookings();

	};


	AdminController.prototype.renderTVTips = function(req, res) {

		var marketId = 'nl';

		new TVTipsService().once('getTVTips', function(tvTips) {

			res.render('layouts/admin/tvtips.jade', {
				tvTips : tvTips
			});

		}).getTVTips(marketId);

	};

	AdminController.prototype.renderPopularChannels = function(req, res) {

		var marketId = 'nl';

		new ChannelService().once('getPopularChannels', function(popularChannelIds) {

			// res.render('layouts/admin/tvtips.jade', {
			// 	tvTips : tvTips
			// });

			res.send(popularChannelIds);

		}).getPopularChannels(marketId);

	};


	/** @return */

	return AdminController;

});