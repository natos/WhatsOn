/* 
* MoviesController
* ----------
*
*/

define([

	'config/app',
	'modules/app',
	'views/movies'

], function MoviesController(c, App, MoviesView) {

/* private */

	/* constructor */
	function initialize() {

		return this;

	};

/* public */
	return {
		name: 'movies',
		initialize: initialize,
		view: MoviesView
	};

});