/**
 *	ProgrammeController
 */

define([

	/** @require */

	// services
	'services/programme',

	// utils
	'utils/metadata',
	'utils/dateutils',
	'utils/requestn',

	'prettydate',

	// mocks
	'mocks/channels'

],


/**
 *	@class ProgrammeController
 */

function(ProgrammeService, Metadata, DateUtils, Requestn, PrettyDate, Channels) {

	/** @constructor */

	var ProgrammeController = function(app) {

		_app = app;

		// Routing

		app.server.get('/programme/:id', this.render);

		app.server.get('/programme/:id/details.json', this.renderDetails);

		app.server.get('/programme/:id/events.json', this.renderEvents);

		app.server.get('/programme/:id/next.json', this.renderNext);


	};


	/** @private */

	var _app,

		metadata = new Metadata(),

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

				if (response[PROGRAMME_DETAILS].body === '{}') {
					// empty response
					console.log('Empty response');
					res.render(req.xhr ? 'contents/404.jade' : 'layouts/404.jade', {
						metadata	: metadata.get(),
						config		: _app.config,
						url			: _app.config.APP_URL + '404/',
						title		: '404',
						prefix		: 'og: http://ogp.me/ns# fb: http://ogp.me/ns/fb# upc-social: http://ogp.me/ns/fb/upc-social#',
						supports	: req.supports,
						xhr			: req.xhr

					});
					return;
				}

				var _programme_details = JSON.parse( response[PROGRAMME_DETAILS].body ),
					_programme_events = JSON.parse( response[PROGRAMME_EVENTS].body );

				// add the events collection to the response body
				_programme_details.events = _programme_events;

				// Is a film, I need to change the og:type 
				//var isMovie = (_programme_details.subcategory.category.name.toLowerCase() == 'speelfilm');

				// Meta data
				var _metadata = [
//					{ property: "og:type"			, content: (isMovie) ? "video.movie" : "video.tv_show" },
					{ property: "og:type"			, content: "video.tv_show" },
					{ property: "og:description"	, content: _programme_details.shortDescription },
					{ property: "og:url"			, content: "http://upcsocial.herokuapp.com/programme/" + _programme_details.id },
					{ property: "og:title"			, content: _programme_details.title }
				];

				var template = req.xhr ? 'contents/programme.jade' : 'layouts/programme.jade';

				res.render(template, {
					metadata	: metadata.override(_metadata, 'property').get(),
					config		: _app.config,
					channels	: _app.channels,
					url			: _app.config.APP_URL + 'programme/' + _programme_details.id,
					data		: _programme_details,
					title		: _programme_details.title,
					prefix		: 'og: http://ogp.me/ns# fb: http://ogp.me/ns/fb# upcsocial: http://ogp.me/ns/fb/upcsocial#',
					supports	: req.supports,
					xhr			: req.xhr
				}); // HTML output	
		});

	};

	/** Render a JSON of programme details */
	ProgrammeController.prototype.renderDetails = function(req, res) {

		var id = req.params.id;

		new ProgrammeService().once('getDetails', function(error, response, body) {

			var programme_details = {};

			if ( !response || /500|404/.test(response.statusCode) ) {
				programme_details = [{ "statusCode" : "404" }];
			} else {
				programme_details = JSON.parse(body);
			}


			/* response */

			// JSONP support
			if (res.isJsonp) {
				res.contentType('json');
				res.send( res.isJsonp + '(' + JSON.stringify(programme_details) + ');' );
				res.end();
				return;
			}

			// normal response
			res.send(programme_details); // JSON output
			res.end();

		}).getDetails(id);

	};


	/** Render a JSON of programme events */
	ProgrammeController.prototype.renderEvents = function(req, res) {

		var id = req.params.id;

		new ProgrammeService().once('getEvents', function(error, response, body) {

			var programme_events = [], now = new Date();

			if ( !response || /500|404/.test(response.statusCode) ) {
				programme_events = [{ "statusCode" : "404" }];
			} else {
				programme_events = JSON.parse(body);
				programme_events = dateUtils.prettifyCollection(programme_events, 'startDateTime');
				programme_events.forEach(function(el, ix, arr) {
					el.simpleTime = strftime(new Date(Date.parse(el.startDateTime)), '%R');
				});

			}

			/* response */

			// JSONP support
			if (res.isJsonp) {
				res.contentType('json');
				res.send( res.isJsonp + '(' + JSON.stringify(programme_events) + ');' );
				res.end();
				return;
			}

			// normal response
			res.send(programme_events); // JSON output
			res.end();

		}).getEvents(id);

	};


	/** Render a JSON of next programme event */
	ProgrammeController.prototype.renderNext = function(req, res) {

		var REQUEST_NEXT = [],
			RESPONSE_NEXT = {};
			// id param is a querystring with programmes ids divided by '-'
			id = req.params.id;
			id.split('-').map(function(id) {
				REQUEST_NEXT.push('http://' + req.headers.host + '/programme/' + id + '/events.json');
			}),
			sortFunction = function(a, b) {
				return new Date( (a.startDateTime).replace(/-/g,"/").replace(/[TZ]/g," ") ) - new Date( (b.startDateTime).replace(/-/g,"/").replace(/[TZ]/g," ") );
			}

		Requestn(REQUEST_NEXT, function(response) {

			var url, programme, events, i, t, next, _startDateTime, now = new Date();

			for (url in response) {

				programme = response[url];
				events = JSON.parse(programme.body);
				events.sort(sortFunction);

				t = events.length;

				for (i = 0; i < t; i++) {

					event = events[i];

					if (/404|500/.test(event.statusCode)) { continue; }

					_startDateTime = new Date((event.startDateTime).replace(/-/g,"/").replace(/[TZ]/g," ")).valueOf();

					if (_startDateTime.valueOf() > now.valueOf()) {
						RESPONSE_NEXT[_startDateTime] = event;
						break;
					}

				};

			}

			/* response */

			// JSONP support
			if (res.isJsonp) {
				res.contentType('json');
				res.send( res.isJsonp + '(' + JSON.stringify(RESPONSE_NEXT) + ');' );
				res.end();
				return;
			}

			// normal response
			res.send(RESPONSE_NEXT); // JSON output
			res.end();

		});

		return;

	};

	/** @return */

	return ProgrammeController;

});