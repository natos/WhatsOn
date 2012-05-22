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

	/**
	 * Activate the associated view, and set up event handlers
	 */
	function initialize() {
console.log('moviesController.initialize');
		MoviesView.initialize();

		return this;

	};

	/**
	 * Deactivate the associated view, and clean up event handlers
	 */
	function finalize() {

		MoviesView.finalize();

	};


	/* public */
	return {
		name: 'movies',
		initialize: initialize,
		finalize: finalize,
		view: MoviesView
	};

});