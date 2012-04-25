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
	'utils/dateutils'

],


/**
*	@class SearchController
*/

function(querystring, Search, Metadata, DateUtils) {

	/** @constructor */

	var SearchController = function(app) {

		_app = app;

		// Routing

		app.server.get('/search', this.render);

	};


	/** @private */

	var _app,

		metadata = new Metadata(),

		SearchService = new Search(),

		dateUtils = new DateUtils();


	/** @public */

	SearchController.prototype.render = function(req, res) {

		var query = querystring.escape(req.query.q);

		// avoid empty query
		if (!query) { res.end(); return; }

		SearchService.once('search', function(error, response, body) {

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

			// avoid fixed positions on Search result pages
			var _supports = Object.create(req.supports);
				_supports.positionFixed = false;

			res.render('search-results.jade', {
				metadata		: metadata.get(),
				config			: _app.config,
				query			: query,
				used_channels	: used_channels,
				used_datetimes	: used_datetimes,
				programmes		: programmes,
				supports		: _supports
			});

		}).search(query);

	};


	/** @return */

	return SearchController;

});