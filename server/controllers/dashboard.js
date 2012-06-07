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

		var coolPics = [
			'8ad586a135af96b70135afe916940151',
			'8ad586a135af96b70135afead6ef0166',
			'8ad586a135c83fb50135e242d4720a75',
			'8ad586a135af96b70135c381691a0a27',
			'8ad586a135af96b70135aff20fb801b2',
			'8ad586a135af96b70135c3910b330a31',
			'8ad586a135af96b70135afece649017b',
			'8ad586a135af96b70135aff4c1ae01db',
			'8ad586a135af96b70135aff6b58a01f0',
			'8ad586a135af96b70135aff825040205',
			'8ad586a135af96b70135b0254f4e0341',
			'8ad586a135af96b70135b033bc610391',
			'8ad586a135af96b70135b03b20bc03e2',
			'8ad586a135af96b70135b0397b5903cb',
			'8ad586a135af96b70135bf64939309ea',
			'8ad586a135af96b70135b03cce4703f5',
			'8ad586a135af96b70135bf41ffe609d3',
			'8ad586a135af96b70135be79610005ee',
			'8ad586a135af96b70135be6725af05b7',
			'8ad586a135af96b70135bf45fd6709da',
			'8ad586a135af96b70135bf50c0b809e1',
			'8ad586a135af96b70135c3cf710e0a6b',
			'8ad586a135af96b70135c3d2edf90a6f',
			'8ad586a135c83fb50135c869800b0001',
			'8ad586a135af96b70135bed29b9f078c',
			'8ad586a135af96b70135bec8927d0730',
			'8ad587a135e838d50135ee54544f075c',
			'8ad587a135c42a2c0135c4fcb2980053',
			'8ad586a135c83fb50135c87e4ace0011',
			'8ad586a135c83fb50135c87d21f9000c',
			'8ad586a135c83fb50135c8795ab80008',
			'8ad586a135af96b70135c3e20a470a7c',
			'8ad586a135af96b70135bf7cd35a09f7'
		];

		// randomize pictures
		coolPics.sort(function() { return 0.5 - Math.random(); });

		var topbookings, render = function() {

			if (!topbookings) { return; }

			// Add cool pictures to each event
			function addCoolPicture(event) { event.picture = coolPics.shift(); };
			// Prettify dates
			function prettifyCollection(event) { event.prettyDate = dateUtils.prettify(event['startDateTime']); };

			topbookings.map(prettifyCollection);
			topbookings.map(addCoolPicture);			

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