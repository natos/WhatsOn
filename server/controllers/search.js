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

		app.server.get('/search.html', this.render);

	};


	/** @private */

	var _app,

		metadata = new Metadata(),

		SearchService = new Search(),

		dateUtils = new DateUtils();


	/** @public */

	SearchController.prototype.render = function(req, res) {

		var query = querystring.escape(req.query.q) || '';

		SearchService.once('search', function(error, response, body) {

			var results = JSON.parse(body);

			// Prettyfing dates
			results = dateUtils.prettifyCollection(results, 'startDateTime');
			
			// Sorting results
			results.sort(function sortResults(a, b) {
				return new Date(a.startDateTime).valueOf() - new Date(b.startDateTime).valueOf();
			});

			// Get used channels and times, you know, maps.
			// this will be help the filters later
			var used_channels = {},
				used_datetimes = {},
				t = results.length;

			while(t--) {
				used_channels[results[t].channel.id] = results[t].channel;
				used_datetimes[results[t].prettyDate] = results[t].startDateTime;
			}

			res.render('search.jade', {
				metadata		: metadata.get(),
				config			: _app.config,
				used_channels	: used_channels,
				used_datetimes	: used_datetimes,
				results			: results,
				supports		: req.supports
			});

		}).search(query);

	};


	/** @return */

	return SearchController;

});