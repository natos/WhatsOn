/**
 *	ProgrammeController
 */

define([

	/** @require */

	// services
	'services/programme',

	// utils
	'utils/metadata',
	'utils/supports',
	'utils/dateutils',
	'utils/requestn'

],


/**
 *	@class ChannelController
 */

function(Programme, Metadata, Supports, DateUtils, Requestn) {

	/** @constructor */

	var ProgrammeController = function(app) {

		_app = app;

		// Routing

		app.server.get('/programme/:id.html', this.render);

		app.server.get('/programme/:id/details.json', this.renderDetails);

		app.server.get('/programme/:id/events.json', this.renderEvents);

	};


	/** @private */

	var _app,

		metadata = new Metadata(),

		ProgrammeService = new Programme(),

		dateUtils = new DateUtils();

	/** @public */

	/** Render a channel page */
	ProgrammeController.prototype.render = function(req, res) {

		var id = req.params.id;

		var PROGRAMME_DETAILS = 'http://' + req.headers.host + '/programme/' + id + '/details.json',
			PROGRAMME_EVENTS = 'http://' + req.headers.host + '/programme/' + id + '/events.json';

		Requestn(

			[PROGRAMME_DETAILS, PROGRAMME_EVENTS],

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

				var _programme_details = JSON.parse( response[PROGRAMME_DETAILS].body ),
					_programme_events = JSON.parse( response[PROGRAMME_EVENTS].body );

				// add the events collection to the response body
				_programme_details.events = _programme_events;

				// Is a film, I need to change the og:type 
				var isMovie = (_programme_details.subcategory.category.name.toLowerCase() == 'speelfilm');

				// Meta data
				var _metadata = [
					{ property: "og:type"			, content: (isMovie) ? "upc-whatson:movie" : "upc-whatson:tv_show" },
					{ property: "og:url"			, content: "http://upcwhatson.herokuapp.com/programme/" + _programme_details.id + ".html" },
					{ property: "og:title"			, content: _programme_details.title },
					{ property: "og:description"	, content: _programme_details.description },
					{ property: "og:image"			, content: "http://upcwhatson.herokuapp.com/assets/upclogo.jpg" }
				];

				res.render('programme.jade', {
					metadata	: metadata.override(_metadata, 'property').get(),
					config		: _app.config,
					data		: _programme_details,
					title		: _programme_details.title,
					prefix		: 'og: http://ogp.me/ns# fb: http://ogp.me/ns/fb# upc-whatson: http://ogp.me/ns/fb/upc-whatson#',
					supports	: req.supports,
					isAjax		: req.isAjax
				}); // HTML output	
		});

	};

	/** Render a JSON of programme details */
	ProgrammeController.prototype.renderDetails = function(req, res) {

		var id = req.params.id;

		ProgrammeService.once('getDetails', function(error, response, body) {

			var programme_details = JSON.parse(body);

			res.send(programme_details); // JSON output

		}).getDetails(id);

	};


	/** Render a JSON of programme events */
	ProgrammeController.prototype.renderEvents = function(req, res) {

		var id = req.params.id;

		ProgrammeService.once('getEvents', function(error, response, body) {

			var programme_events = JSON.parse(body);

				programme_events = dateUtils.prettifyCollection(programme_events, 'startDateTime');

			res.send(programme_events); // JSON output

		}).getEvents(id);

	};

	/** @return */

	return ProgrammeController;

});