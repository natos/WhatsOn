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

/* abstract */

	function initialize() {

		return this;

	}

	function finalize() {

		return this;
	}


/* export */

	return new Controller({
		name		: name,
		initialize	: initialize,
		finalize	: finalize,
		view		: MoviesView
	});

});