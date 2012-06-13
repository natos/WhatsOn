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
		console.log('Canvas Module','Starting transition');
		a.$transition.appendTo(a.$body).removeClass('hide'); 
	};

	function endTransition() { 
		console.log('Canvas Module','Ending transition');
		// just wait, so the view won't blink while rendering,
		// better UX feedback with smoother transition
//		setTimeout(function() {
			a.$transition.addClass('hide'); 
			setTimeout(function() { 
				a.$transition.remove(); 
			}, 500); 
//		}, 500);
	};

	/* 
	*	Load controllers
	*/
	function loadController(State) {
		// something went wrong
		if (!State) {
			console.log('Canvas Module', 'Something went wrong on the navigation! While trying to load a controller got an empty State as argument.');
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
			console.log('Canvas Module', State.controller, ' doesn\'t exists, go an get one.');
			// Controller is not cached, go and get one
			fetchController('controllers/' + State.controller);
			return;
		}

		// Check if the controller has a intialize method, all controllers must have one
		if (typeof cachedController[INITIALIZE] !== "function") {
			console.log('Canvas Module', cachedController.name + ' doesn\'t have a \'initialize\' method available.');
			return;
		}
		console.log('----------------------------- INITIALIZING -------------------------------' + State.controller);
		// Everything seems fine
		// Initialize controller
		cachedController[INITIALIZE](State);
	};

	// async load controllers with require
	function fetchController(controller) {
		require([controller], mapController);
	};

	// Save the current state of the controller
	// on a local map for later use
	function mapController(controller) {
		controllers[controller.name] = controller;
		loadController(CURRENT_STATE);
	};

	// unload a controller
	function unloadController(State) {
		// something went wrong
		if (!State) {
			console.log('Canvas Module', 'Something went wrong on the navigation! While trying to unload a controller got an empty State as argument.');
			return;
		}
		// finalize controller
		finalizeController(controllers[State.controller]);
	};

	function finalizeController(controller) {
		if (typeof controller[FINALIZE] !== "function") {
			console.log('Canvas Module', controller.name + ' can\'t be finalized, \'finalize\' method is not a function.');
			return;	
		}
		// save controller and initialize
		// we save because the public export 
		// of the controller may change
		mapController(controller[FINALIZE]());
	};


	/* 
	*	Navigate
	*/
	function navigate(State) {

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

	};


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
		/* View live cycle 	*/ 
		App.on(a.VIEW_INITIALIZING, function(view) { console.log('Canvas Module', view.name, 'VIEW_INITIALIZING'); });
		App.on(a.VIEW_INITIALIZED, function(view) { console.log('Canvas Module', view.name, 'VIEW_INITIALIZED'); });
		App.on(a.VIEW_RENDERING, function(view) { console.log('Canvas Module', view.name, 'VIEW_RENDERING'); });
		App.on(a.VIEW_RENDERED, function(view) { console.log('Canvas Module', view.name, 'VIEW_RENDERED'); });
		App.on(a.VIEW_FINALIZING, function(view) { console.log('Canvas Module', view.name, 'VIEW_FINALIZING'); });
		App.on(a.VIEW_FINALIZED, function(view) { console.log('Canvas Module', view.name, 'VIEW_FINALIZED'); });
		/* Controller live cycle */
		App.on(a.CONTROLLER_INITIALIZING, function(view) { console.log('Canvas Module', view.name, 'CONTROLLER_INITIALIZATING'); });
		App.on(a.CONTROLLER_INITIALIZED, function(view) { console.log('Canvas Module', view.name, 'CONTROLLER_INITIALIZATED'); });
		App.on(a.CONTROLLER_FINALIZING, function(view) { console.log('Canvas Module', view.name, 'CONTROLLER_FINALIZATING'); });
		App.on(a.CONTROLLER_FINALIZED, function(view) { console.log('Canvas Module', view.name, 'CONTROLLER_FINALIZED'); });
		
		return this;
	};

	/* destructor */
	function finalize() {

		App.off(a.NAVIGATE, navigate);
		App.off(a.VIEW_RENDERED, endTransition);

	};

/* export */

	return {
		name: name,
		controllers: controllers,
		initialize: initialize,
		finalize: finalize,
	};

});