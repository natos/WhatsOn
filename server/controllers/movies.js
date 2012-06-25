/**
 *	MoviesController
 */

define([

	/** @require */

	// services
	'services/movies',

	// utils
	'utils/dateutils',
	'utils/metadata',

	// mocks
	'mocks/channels'

],


/**
 *	@class MoviesController
 */

function(MoviesService, DateUtils, Metadata, Channels) {

	/** @constructor */

	var MoviesController = function(app) {

		_app = app;

		// Routing

		app.server.get('/movies', this.render);

	};


	/** @private */

	var _app,

		metadata = new Metadata();

	/** @public */

	MoviesController.prototype.render = function(req, res) {

		var topmovies, render = function() {

			var template = req.xhr ? 'contents/movies.jade' : 'layouts/movies.jade'

			res.render(template, {
				metadata	: metadata.get(),
				config		: _app.config,
				channels	: _app.channels,
				topmovies 	: topmovies,
				supports	: req.supports,
				xhr			: req.xhr
			});

		};

		new MoviesService().once('getTopMovies', function(error, response, body) {

			topmovies = JSON.parse(body);

			render();

		}).getTopMovies();

	};


	/** @return */

	return MoviesController;

});