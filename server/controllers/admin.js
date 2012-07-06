/**
 *	AdminController
 */

define([

	/** @require */

	// services
	'services/bookings',
	'services/tvtips',

	// utils
	'utils/dateutils'

],


/**
 *	@class AdminController
 */

function(BookingsService, TVTipsService, DateUtils) {

	/** @constructor */

	var AdminController = function(app) {

		_app = app;

		// Routing

		app.server.get('/admin/topbookings', this.renderTopBookings);
		app.server.get('/admin/tvtips', this.renderTVTips);
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


	/** @return */

	return AdminController;

});