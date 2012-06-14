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

], function SearchController(a, App, Controller, SearchView) {

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

	return {
		name: name,
		initialize: initialize,
		finalize: finalize,
		view: SearchView
	};

});