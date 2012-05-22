/**
 *	ChannelController
 */

define([

	/** @require */

	// services
	'services/channel',

	// utils
	'utils/metadata',
	'utils/dateutils',
	'utils/requestn',

	'prettydate'
],


/**
 *	@class ChannelController
 */

function(Channel, Metadata, DateUtils, Requestn, PrettyDate) {

	/** @constructor */

	var ChannelController = function(app) {

		_app = app;

		// Routing

		app.server.get('/channel/:id', this.render);

		app.server.get('/channels.json', this.renderChannels);

		app.server.get('/channel/:id/details.json', this.renderDetails);

		app.server.get('/channel/:id/events.json', this.renderEvents);

	};


	/** @private */

	var _app,

		metadata = new Metadata(),

		ChannelService = new Channel(),

		dateUtils = new DateUtils();

	/** @public */

	/** Render a channel page */
	ChannelController.prototype.render = function(req, res) {

		var id = req.params.id;

		var CHANNEL_DETAILS = 'http://' + req.headers.host + '/channel/' + id + '/details.json',
			CHANNEL_EVENTS = 'http://' + req.headers.host + '/channel/' + id + '/events.json';

		Requestn(

			[CHANNEL_DETAILS, CHANNEL_EVENTS],

			function(response) {

				// API Error?
				var error, API;
				for (API in response) {
					if ( response[API].response.statusCode === 500 || response[API].response.statusCode === 404) {
						error = response[API].body + ' requesting: ' + API;
						console.log(error);
						res.send(error);
						return;
					}
				}

				var _channel_details = JSON.parse( response[CHANNEL_DETAILS].body ),
					_channel_events = JSON.parse( response[CHANNEL_EVENTS].body );

				// Add date offset and formatted start-end time range to events.
				// Group events by date.
				var strftime = PrettyDate.strftime;
				var now = new Date();
				var dateGroups = [];
				var previousDay = 0;
				_channel_events.forEach(function(el, ix, arr){
					var startDate = new Date(Date.parse(el.startDateTime));
					var endDate = new Date(Date.parse(el.endDateTime));
					el.timeRange = strftime(startDate, '%R') + ' - ' + strftime(endDate, '%R');

					var day = startDate.getDay();
					if (day !== previousDay) {
						dateGroups.push({
							dateText : strftime(startDate, '%A %e %B'),
							events : []
						});
						previousDay = day;
					}
					dateGroups[dateGroups.length - 1].events.push(el);
				});
				_channel_details.dates = dateGroups;

				// Meta data
				var _metadata = [
					{ property: "og:type"			, content: "upcsocial:tv_channel" },
					{ property: "og:url"			, content: "http://upcsocial.herokuapp.com/channel/" + _channel_details.id },
					{ property: "og:title"			, content: _channel_details.name },
					{ property: "og:description"	, content: _channel_details.description }
				];

				res.render('channel.jade', {
					metadata	: metadata.override(_metadata, 'property').get(),
					config		: _app.config,
					url			: _app.config.APP_URL + 'channel/' + _channel_details.id,
					data		: _channel_details,
					title		: _channel_details.name,
					prefix		: 'og: http://ogp.me/ns# fb: http://ogp.me/ns/fb# upc-whatson: http://ogp.me/ns/fb/upc-whatson#',
					supports	: req.supports,
					TEST_MODE	: false
				}); // HTML output	
		});

	};

	/** Render a JSON response of all channels */
	ChannelController.prototype.renderChannels = function(req, res) {

		var id = req.params.id;

		ChannelService.once('getChannels', function(channels) {

			res.send(channels); // JSON output

		}).getChannels();

	};

	/** Render a JSON of channel details */
	ChannelController.prototype.renderDetails = function(req, res) {

		var id = req.params.id;

		ChannelService.once('getDetails', function(error, response, body) {

			var channel_details = JSON.parse(body);

			res.send(channel_details); // JSON output

		}).getDetails(id);

	};


	/** Render a JSON of channel events */
	ChannelController.prototype.renderEvents = function(req, res) {

		var id = req.params.id;

		ChannelService.once('getEvents', function(error, response, body) {

			var channel_events = JSON.parse(body);

				channel_events = dateUtils.prettifyCollection(channel_events, 'startDateTime');

			res.send(channel_events); // JSON output

		}).getEvents(id);

	};

	/** @return */

	return ChannelController;

});