/* 
* SearchController 
* --------------
*
*/

define([

	'config/app',
	'modules/app',
	'lib/flaco/controller',
	'views/search'

], function SearchController(a, App, Controller, searchView) {

	var name = 'search';

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
		name: name,
		initialize: initialize,
		finalize: finalize,
		view: searchView
	});

});