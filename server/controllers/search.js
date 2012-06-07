/**
 *	SearchController
 */

define([

	/** @require */

	// modules
	'querystring',

	// services
	'services/search',

	// utils
	'utils/metadata',
	'utils/dateutils',

	// mocks
	'mocks/channels'
],


/**
*	@class SearchController
*/

function(querystring, SearchService, Metadata, DateUtils, Channels) {

	/** @constructor */

	var SearchController = function(app) {

		_app = app;

		// Routing

		app.server.get('/search', this.render);

	};


	/** @private */

	var _app,

		metadata = new Metadata(),

		dateUtils = new DateUtils();


	/** @public */

	SearchController.prototype.render = function(req, res) {

		var query = querystring.escape(req.query.q),
			template = req.xhr ? 'contents/search.jade' : 'layouts/search.jade';

		// empty query
		// just render a search box
		if (!query) {

			res.render(template, {
				metadata		: metadata.get(),
				config			: _app.config,
				query			: query,
				used_channels	: {},
				used_datetimes	: {},
				programmes		: {},
				channels		: Channels,
				supports		: req.supports
			});

			return; 
		}

		new SearchService().once('search', function(error, response, body) {

			var results = JSON.parse(body);

			// Prettyfing dates
			results = dateUtils.prettifyCollection(results, 'startDateTime');
			
			// Sorting results
			results.sort(function sortResults(a, b) {
				return new Date(a.startDateTime).valueOf() - new Date(b.startDateTime).valueOf();
			});


			// Group results by Programme id
			var i = 0,
				t = results.length,
				_id, _title,
				programmes = {},
				used_channels = {},
				used_datetimes = {};

			for (i; i < t; i++) {

				_id = results[i].programme.id;
				_title = results[i].programme.title;

				if (programmes[_title]) {
					programmes[_title].push(results[i]);
				} else {
					programmes[_title] = [results[i]];
				}

				// Get used channels and times, you know, maps.
				// this will be help the filters later
				used_channels[results[i].channel.id] = results[i].channel;
				used_datetimes[results[i].prettyDate] = results[i].startDateTime;

			}

			var template = req.xhr ? 'contents/search.jade' : 'layouts/search.jade';

			res.render(template, {
				metadata		: metadata.get(),
				config			: _app.config,
				query			: query,
				used_channels	: used_channels,
				used_datetimes	: used_datetimes,
				programmes		: programmes,
				supports		: req.supports
			});

		}).search(query);

	};


	/** @return */

	return SearchController;

});