/* 
* CanvasModule
* ----------------
*
*
*/

define([

	'config/app',
	'modules/app',
	'modules/router'

], function CanvasModuleScope(a, App, Router) {

	var name = 'canvas';

/* private */

	// shift
	var shift = Array.prototype.shift,
		// current state
		CURRENT_STATE = false,
		// constants
		INITIALIZE = 'initialize',
		FINALIZE = 'finalize';

	/* 
	*	Transition 
	*/
	function startTransition() {
		a.$transition.appendTo(a.$body).removeClass('hide'); 
	}

	function endTransition() { 
		// just wait, so the view won't blink while rendering,
		// better UX feedback with smoother transition
		a.$transition.addClass('hide'); 
		setTimeout(function removeTransition() { 
			a.$transition.remove(); 
		}, 500); 
	}

	/* 
	*	Load controllers
	*/
	function loadController(State) {
		// something went wrong
		if (!State) {
			console.log('loadController','State object is empty, can\'t load a controller without information.');
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
			console.log('loadController', State.controller, ' doesn\'t exists, go an get it, lazy loading.');
			// Controller is not cached, go and get one
			fetchController('controllers/' + State.controller);
			return;
		}

		// Check if the controller has a intialize method, all controllers must have one
		if (typeof cachedController[INITIALIZE] !== "function") {
			console.log('Canvas Module', cachedController.name + ' doesn\'t have a \'initialize\' method available.');
			return;
		}
		// Everything seems fine
		// Initialize controller
//		console.log(' ------------------ LOAD CONTROLLER: ' + cachedController.name + ' --------------------');
		intializeController(cachedController);
		
	}

	function intializeController(controller) {
//		console.log(' ------------------ INITIALIZE CONTROLLER: ' + controller.name + ' --------------------');
		controller[INITIALIZE](CURRENT_STATE);
	}

	// async load controllers with require
	function fetchController(controller) {
//		console.log(' ------------------ FETCH CONTROLLER: ' + controller + ' --------------------');
		require([controller], mapController);
	}

	// Save the current state of the controller
	// on a local map for later use
	function mapController(controller) {
		controllers[controller.name] = controller;
		intializeController(controller);
	}

	// unload a controller
	function unloadController(State) {
		// something went wrong
		if (!State) {
			console.log('unloadController','State object is empty, must be the first load.');
			return;
		}
		// finalize controller
//		console.log(' ------------------ UN-LOAD CONTROLLER: ' + State.controller + ' --------------------');
		finalizeController(controllers[State.controller]);
	}

	function finalizeController(controller) {
		if (typeof controller[FINALIZE] !== "function") {
			console.log('Canvas Module', controller.name + ' can\'t be finalized, \'finalize\' method is not a function.');
			return;	
		}
		// finalize controller
//		console.log(' ------------------ FINALIZE CONTROLLER: ' + controller.name + ' --------------------');
		controller[FINALIZE]();
	}


	/* 
	*	Navigate
	*/
	function navigate(State) {

//		console.log(' ------------------ NAVIGATE: ' + State.controller + ' --------------------', arguments);

		if (typeof State === 'undefined') {
			console.log('Canvas Module', 'State object is empty. Stop navigation.');
			return;
		}

		if (State === CURRENT_STATE) {
			console.log('Canvas Module', State.name + ' controller already loaded.');
			return;
		}

		unloadController(CURRENT_STATE);
		loadController(State);

	}


/* public */

	// controllers map
	var controllers = {};

	/* constructor */
	function initialize() {
		
		// listening the router
		App.on(a.NAVIGATE, navigate);
		// when navigation starts
		// add a transition state
		App.on(a.NAVIGATE, startTransition);
		// and when finish rendereding,
		// remove transition
		App.on(a.VIEW_RENDERED, endTransition);


		// DEBUGGING Handlers
		/* View live cycle
		App.on(a.VIEW_INITIALIZING, function(view) { console.log('Canvas Module', view.name, 'VIEW_INITIALIZING'); });
		App.on(a.VIEW_INITIALIZED, function(view) { console.log('Canvas Module', view.name, 'VIEW_INITIALIZED'); });
		App.on(a.VIEW_RENDERING, function(view) { console.log('Canvas Module', view.name, 'VIEW_RENDERING'); });
		App.on(a.VIEW_RENDERED, function(view) { console.log('Canvas Module', view.name, 'VIEW_RENDERED'); });
		App.on(a.VIEW_FINALIZING, function(view) { console.log('Canvas Module', view.name, 'VIEW_FINALIZING'); });
		App.on(a.VIEW_FINALIZED, function(view) { console.log('Canvas Module', view.name, 'VIEW_FINALIZED'); });
		*/
		/* Controller live cycle 
		App.on(a.CONTROLLER_INITIALIZING, function(view) { console.log('Canvas Module', view.name, 'CONTROLLER_INITIALIZATING'); });
		App.on(a.CONTROLLER_INITIALIZED, function(view) { console.log('Canvas Module', view.name, 'CONTROLLER_INITIALIZATED'); });
		App.on(a.CONTROLLER_FINALIZING, function(view) { console.log('Canvas Module', view.name, 'CONTROLLER_FINALIZATING'); });
		App.on(a.CONTROLLER_FINALIZED, function(view) { console.log('Canvas Module', view.name, 'CONTROLLER_FINALIZED'); });
		*/
		return this;
	}

	/* destructor */
	function finalize() {

		App.off(a.NAVIGATE, navigate);
		App.off(a.NAVIGATE, startTransition);
		App.off(a.VIEW_RENDERED, endTransition);

		return this;
	}

/* export */

	return {
		name: name,
		controllers: controllers,
		initialize: initialize,
		finalize: finalize
	};

});