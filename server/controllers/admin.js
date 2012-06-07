/**
 *	AdminController
 */

define([

	/** @require */

	// services
	'services/bookings',

	// utils
	'utils/dateutils'

],


/**
 *	@class AdminController
 */

function(Bookings, DateUtils) {

	/** @constructor */

	var AdminController = function(app) {

		_app = app;

		// Routing

		app.server.get('/admin/topbookings', this.renderTopBookings);
	};


	/** @private */

	var _app,

		dateUtils = new DateUtils(),

		BookingsService = new Bookings();


	/** @public */

	AdminController.prototype.renderTopBookings = function(req, res) {

		var topbookings;

		var render = function() {

			if (!topbookings) { return; }

			topbookings = dateUtils.prettifyCollection(topbookings, 'startDateTime');

			res.render('layouts/admin/topbookings.jade', {
				topbookings : topbookings,
				baseImageUrl : 'http://aleona.eu/clients/upc/programme-images'
			});

		};

		BookingsService.once('getTopBookings', function(error, response, body) {

			topbookings = JSON.parse(body);

			// Every event is wrapped in an array: unwrap them
			topbookings = (function() {	var events = []; topbookings.forEach(function(e, i) { events.push(e[0]); }); return events; }());

			render();

		}).getTopBookings();

	};


	/** @return */

	return AdminController;

});