/* 
* CanvasModule
* ----------------
*
*
*/

define([

	'config/app',
	'config/user',
	'models/app',
	'views/menu',
	'modules/app',
	'modules/event',
	'modules/router',
	'utils/transition'

], function CanvasModuleScope(a, u, AppModel, Menu, App, Event, Router, transition) {

	var name = 'canvas',

/* private */

		// current state
		CURRENT_STATE = false,
		// constants
		INITIALIZE = 'initialize',
		FINALIZE = 'finalize';

	/*
	*	Load controllers
	*/
	function loadController(State) {
		// something went wrong
		if (!State) {
			console.log('<CANVAS>','loadController','State object is empty, can\'t load a controller without information.');
			return;
		}

		// Save the current state
		CURRENT_STATE = State;

		// Grab the cachedController
		// This could be undefined
		var cachedController = controllers[State.controller];

		// Controller doesn't exist yet
		// Async load the requested controller
		if (typeof cachedController === 'undefined') {
			console.log('<CANVAS>','loadController', State.controller, ' doesn\'t exists, go an get it, lazy loading.');
			// Controller is not cached, go and get one
			fetchController('controllers/' + State.controller);
			return;
		}

		// Check if the controller has a intialize method, all controllers must have one
		if (typeof cachedController[INITIALIZE] !== "function") {
			console.log('<CANVAS>', cachedController.name + ' doesn\'t have a \'initialize\' method available.');
			return;
		}
		// Everything seems fine
		// Initialize controller
		console.log(' ------------------ LOAD CONTROLLER: ' + cachedController.name + ' --------------------');
		intializeController(cachedController);
	}

	function intializeController(controller) {
		console.log(' ------------------ INITIALIZE CONTROLLER: ' + controller.name + ' --------------------');
		controller[INITIALIZE](CURRENT_STATE);
	}

	// async load controllers with require
	function fetchController(controller) {
		console.log(' ------------------ FETCH CONTROLLER: ' + controller + ' --------------------');
		require([controller], function mapController(controller) {
			controllers[controller.name] = controller;
			intializeController(controller);
		});
	}

	// unload a controller
	function unloadController(State) {
		// something went wrong
		if (!State) {
			console.log('<CANVAS>','unloadController','State object is empty, must be the first load.');
			return;
		}
		// finalize controller
		console.log(' ------------------ UN-LOAD CONTROLLER: ' + State.controller + ' --------------------');
		finalizeController(controllers[State.controller]);
	}

	function finalizeController(controller) {
		if (typeof controller[FINALIZE] !== "function") {
			console.log('<CANVAS>', controller.name + ' can\'t be finalized, \'finalize\' method is not a function.');
			return;
		}
		// finalize controller
		console.log(' ------------------ FINALIZE CONTROLLER: ' + controller.name + ' --------------------');
		controller[FINALIZE]();
	}


	/*
	*	Navigate
	*/
	function navigate(State) {

		console.log('<CANVAS>',' ------------------ NAVIGATE: ' + State.controller + ' --------------------', arguments);

		if (typeof State === 'undefined' || State.controller === "") {
			console.log('<CANVAS>', 'WARNING: State object is empty. Redirecting to DASHBOARD');
			// load dashboard
			Router.navigate({}, 'dashboard', '/dashboard');
			return;
		}

		if (State === CURRENT_STATE) {
			console.log('<CANVAS>', State.name + ' controller already loaded.');
			return;
		}

		// is a valid controller?
		if (a.CONTROLLERS.indexOf(State.controller)>=0) {
			// unload current state
			if (CURRENT_STATE) { unloadController(CURRENT_STATE); }
			// load new state
			loadController(State);
			// close menu
			// TODO: Port this to the menu component,
			// and self-close it by listening events
			Menu.close();
		} else {
			// NOT FOUND! 404 thingy here
			// TODO: Not found page
			console.log('404! not found!');
		}

	}

/* public */

	// controllers map
	var controllers = {};

	/* constructor */
	function initialize() {
		
		// listening the router
		Event.on(a.NAVIGATE, navigate);
		// when navigation starts
		// add a transition state
		Event.on(a.NAVIGATE, transition.start);
		// and when finish rendereding,
		// remove transition
		Event.on(a.VIEW_RENDERED, transition.end);
		// DEBUGGING Handlers
		/* View live cycle
		Event.on(a.VIEW_INITIALIZING, function(view) { console.log('<CANVAS>', view.name, 'VIEW_INITIALIZING'); });
		Event.on(a.VIEW_INITIALIZED, function(view) { console.log('<CANVAS>', view.name, 'VIEW_INITIALIZED'); });
		Event.on(a.VIEW_RENDERING, function(view) { console.log('<CANVAS>', view.name, 'VIEW_RENDERING'); });
		Event.on(a.VIEW_RENDERED, function(view) { console.log('<CANVAS>', view.name, 'VIEW_RENDERED'); });
		Event.on(a.VIEW_FINALIZING, function(view) { console.log('<CANVAS>', view.name, 'VIEW_FINALIZING'); });
		Event.on(a.VIEW_FINALIZED, function(view) { console.log('<CANVAS>', view.name, 'VIEW_FINALIZED'); });
		*/
		/* Controller live cycle
		Event.on(a.CONTROLLER_INITIALIZING, function(view) { console.log('<CANVAS>', view.name, 'CONTROLLER_INITIALIZATING'); });
		Event.on(a.CONTROLLER_INITIALIZED, function(view) { console.log('<CANVAS>', view.name, 'CONTROLLER_INITIALIZATED'); });
		Event.on(a.CONTROLLER_FINALIZING, function(view) { console.log('<CANVAS>', view.name, 'CONTROLLER_FINALIZATING'); });
		Event.on(a.CONTROLLER_FINALIZED, function(view) { console.log('<CANVAS>', view.name, 'CONTROLLER_FINALIZED'); });
		*/

		if (!App.can3DTransformPositionFixed()) {
			document.documentElement.className += ' css-no-3d-transform-position-fixed';
		}

		Menu.initialize();

		return this;
	}

	/* destructor */
	function finalize() {

		Event.off(a.NAVIGATE, navigate);
		Event.off(a.NAVIGATE, transition.start);
		Event.off(a.VIEW_RENDERED, transition.end);

		return this;
	}

/* export */

	return {
		name		: name,
		controllers	: controllers,
		initialize	: initialize,
		finalize	: finalize
	};

});