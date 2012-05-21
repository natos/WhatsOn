/* 
* CanvasModule
* ----------------
* This module is responsible for dealing with the main area of the page (the "canvas").
* When a client-side navigation event occurs, the correct view should be displayed.
*/

define([

	'config/app',
	'modules/router'

], function CanvasModule(a, Router) {

/* private */

	// current controller
	var CURRENT,

		// controllers map
		controllers = {};

	/* constructor */
	function initialize() {

		upc.on(a.NAVIGATE, function() {
			
			unload(CURRENT);
			load(arguments);

		});

		// global events, every view loaded, remove transition
		upc.on(a.VIEW_LOADED, endTransition);

		lazyLoadControllers([
			'controllers/channel', 
			'controllers/dashboard',
			'controllers/grid',
			'controllers/movies',
			'controllers/nowandnext',
			'controllers/programme',
			'controllers/settings'
		]);

		return this;
	};

	/* destructor */
	function finalize() {

		upc.off(a.VIEW_LOADED, endTransition);

	};

	/* Pre Load Controllers */
	// lazy require controllers
	function lazyLoadControllers(controllers) {
		require(controllers, mapControllers);
	};
	// map controllers
	function map(controller) {
		// local refernece
		controllers[controller.name] = controller;
		// add a routing control
		Router.add(controller.name, load);
	};
	// iterate controllers
	function mapControllers() {
		while (controller = Array.prototype.shift.apply(arguments)) { map(controller); }
	};
	// handle Routings
	function handleRouting() {
		
	};


	/* Transition */
	function endTransition() {
		a.$transition.addClass('hide');
		setTimeout(function() { a.$transition.remove(); }, 500);
	};


	/* Public functions */
	// load
	function load() {
		// first argument is the module name
		var controller = Array.prototype.shift.apply(arguments)[0];
		// intialize module and send all arguments
		if (controllers[controller]) {
			controllers[controller].initialize(arguments);
		}
	};

	// unload
	function unload(controller) {
		if (controller && map[controller]) {
			map[controller].finalize();
		}
	};


/* public */

	return {
		name: 'canvas',
		initialize: initialize,
		controllers: controllers
	};

});