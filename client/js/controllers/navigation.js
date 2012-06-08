/* 
* NavigationController
* ----------------
*/

define([

	'config/app',
	'modules/app',
	'lib/flaco/controller',
	'views/navigation'

], function NavigationModule(a, App, Controller, NavigationView) {

	var name = 'navigation';

/* private */

/* public */

	function initialize() {

		return this;

	};

	function finalize() {

		return this;

	};

/* export */

	return new Controller({
		name: name,
		initialize: initialize,
		finalize: finalize,
		view: NavigationView
	});

});