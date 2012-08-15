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
		app.server.get('/search/q/:q', this.render);

	};


	/** @private */

	var _app,

		metadata = new Metadata(),

		dateUtils = new DateUtils();


	/** @public */

	SearchController.prototype.render = function(req, res) {

		var template = req.xhr ? 'contents/search.jade' : 'layouts/search.jade';

		var query = '';
		// Query can be specified as '/search?q=monkey' or '/search/q/monkey'
		if (req.query.q) {
			query = querystring.escape(req.query.q);
		} else if (req.params.q) {
			query = querystring.escape(req.params.q);
		}

		// empty query
		// just render a search box
		if (!query) {

			res.render(template, {
				metadata		: metadata.get(),
				config			: _app.config,
				channels		: _app.channels,
				query			: query,
				hasQuery		: false,
				used_channels	: {},
				used_datetimes	: {},
				programmes		: {},
				supports		: req.supports,
				xhr				: req.xhr
			});

			return; 
		}

		new SearchService().once('search', function(error, response, body) {

			var results;

			try {
				results = JSON.parse(body);
			} catch(e) {
				results = [];
			}

			// Prettyfing dates
			results = dateUtils.prettifyCollection(results, 'startDateTime');
			
			// Sorting results
			results.sort(function sortResults(a, b) {
				return new Date(a.startDateTime).valueOf() - new Date(b.startDateTime).valueOf();
			});

			var i = 0, c = 0,
				t = results.length,
				_id, _title,
				date, now, diff,
				programmes = {},
				used_channels = {},
				used_datetimes = {};

			for (i; i < t; i++) {

				_id = results[i].programme.id;
				_title = results[i].programme.title;
				_startDateTime = results[i].startDateTime;

				date = new Date( _startDateTime.replace(/-/g,"/").replace(/[TZ]/g," ") );
				now = new Date( new Date().toJSON().replace(/-/g,"/").replace(/[TZ]/g," ") );
				diff = ((now.getTime() - date.getTime()) / 1000);
				day_diff = Math.round( diff / 86400);

				// is the event is happening in less than 24hs?
				if (day_diff === 0) {

					// Get the channel logo
					for (c = 0; c < _app.channels.length; c++) {
						if (_app.channels[c].id === results[i].channel.id) {
							results[i].channel.logoIMG = _app.channels[c].logoIMG;
						}
					}

					// group by title
					if (programmes[_title]) {
						programmes[_title].push(results[i]);
					} else {
						programmes[_title] = [results[i]];
					}

					// Get used channels and times, you know, maps.
					// this will be help the filters later
					used_channels[results[i].channel.id] = results[i].channel;
					used_datetimes[results[i].prettyDate] = results[i].startDateTime;
				} else if (day_diff) {

				}

			}

			var template = req.xhr ? 'contents/search.jade' : 'layouts/search.jade';

			res.render(template, {
				metadata		: metadata.get(),
				config			: _app.config,
				channels		: _app.channels,
				query			: query,
				hasQuery		: true,
				hasResults		: results.length > 0,
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