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
			CURRENT = arguments[0];

		});

		// global events, every view loaded, remove transition
		upc.on(a.VIEW_LOADED, endTransition);

		loadControllers([
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
	function loadControllers(controllers) {
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


	/**
	 * Load a controller for the canvas
	 * @private
	 */
	function load() {
console.log('canvas.load');
		// first argument is the module name
		var controllerName = Array.prototype.shift.apply(arguments)[0];

		// intialize module and send all arguments
		var controller;
console.log('controllerName = ' + controllerName);
		if (controllerName) {
			controller = controllers[controllerName]
			if (controller && typeof(controller.initialize)==='function') {
				controller.initialize(arguments);
			}
		}
	};

	/**
	 * Unload a controller for the canvas
	 * @private
	 */
	function unload(controllerName) {
		var controller;
		if (controllerName) {
			controller = controllers[controllerName];
			if (controller && typeof(controller.finalize)==='function') {
				controller.finalize();
			}
		}
	};


	/* public */

	return {
		name: 'canvas',
		initialize: initialize,
		controllers: controllers
	};

});