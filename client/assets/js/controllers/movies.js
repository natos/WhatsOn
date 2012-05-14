/* 
* MoviesController
* ----------
*
*/

define([

	'config/app',
	'controllers/app',
	'views/movies'

], function MoviesController(c, App, MoviesView) {

/* private */

	/* constructor */
	function initialize() {

		// Let the App know your here
		App.controllers.movies = this;

		return this;

	};

/* public */
	return {
		initialize: initialize,
		view: MoviesView.initialize()
	};

});