/**
 *	MoviesController
 */

define([

	/** @require */

	// services
	'services/movies',

	// utils
	'utils/dateutils',
	'utils/metadata'

],


/**
 *	@class MoviesController
 */

function(Movies, DateUtils, Metadata) {

	/** @constructor */

	var MoviesController = function(app) {

		_app = app;

		// Routing

		app.server.get('/movies.html', this.render);

	};


	/** @private */

	var _app,

		metadata = new Metadata(),

		MoviesService = new Movies();


	/** @public */

	MoviesController.prototype.render = function(req, res) {

		var topmovies, render = function() {

			res.render('movies.jade', {
				metadata	: metadata.get(),
				config		: _app.config,
				topmovies 	: topmovies,
				supports	: req.supports
			});

		};

		MoviesService.once('getTopMovies', function(error, response, body) {

			topmovies = JSON.parse(body);

			render();

		}).getTopMovies();

	};


	/** @return */

	return MoviesController;

});