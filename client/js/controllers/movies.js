/* 
* MoviesController
* ----------
*
*/

define([

	'config/app',
	'modules/app',
	'lib/flaco/controller',
	'views/movies'

], function MoviesController(c, App, Controller, MoviesView) {

	var name = 'movies';

/* private */

/* public */

	/**
	 * Activate the associated view, and set up event handlers
	 * @public
	 */
	function initialize() {

		return this;

	};

	/**
	 * Deactivate the associated view, and clean up event handlers
	 * @public
	 */
	function finalize() {

	};


/* export */

	return new Controller({
		name: 'movies',
		initialize: initialize,
		finalize: finalize,
		view: MoviesView
	});

});