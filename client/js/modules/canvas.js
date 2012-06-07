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

], function(a, App, Router) {

/* private */

	// shift
	var shift = Array.prototype.shift,
		// current state
		CURRENT_STATE = false,
		// current state
		LAZY_STATE = false;

	/*
	*	Fetch Controllers 
	*/

	// lazy require controllers
	function fetchControllers(controllers) {
		require(controllers, mapControllers);
	};

	// map controllers
	function map(controller) {
		// save the controller in a local refernece
		controllers[controller.name] = controller;
	};

	// iterate controllers
	function mapControllers() {
		while (controller = shift.apply(arguments)) { map(controller); }
		// LAZY_STATE represet a controller wainting to be loaded
		if (LAZY_STATE) { load(LAZY_STATE) };
	};

	/* 
	*	Transition 
	*/
	function startTransition() { a.$transition.appendTo(a.$body).removeClass('hide'); };

	function endTransition() { a.$transition.addClass('hide'); setTimeout(function() { a.$transition.remove(); }, 500); };


	/* 
	*	Load controllers
	*/
	function load(State) {
		// If there's a controller available, intialize(State)
		if (State && controllers[State.controller]) {
			controllers[State.controller].initialize(State);
			CURRENT_STATE = State;
			LAZY_STATE = false;
		} else {
			// The controller is not available
			// save the State to load after the
			// controllers are ready to use
			LAZY_STATE = State;
		}
	};

	// unload a controller
	function unload(State) {
		if (State && controllers[State.controller]) {
			controllers[State.controller].finalize();
		}
	};

	/* 
	*	Navigate
	*/
	function navigate(State) {

		if (State === CURRENT_STATE) {
			console.log('View ' + State.name + ' already loaded.');
			return;
		}

		startTransition();
		unload(CURRENT_STATE);
		load(State);

	};


/* public */

	// controllers map
	var controllers = {};

	/* constructor */
	function initialize() {
		
		// fetch controllers
		fetchControllers([
			'controllers/channel', 
			'controllers/dashboard',
			'controllers/grid',
			'controllers/movies',
			'controllers/nowandnext',
			'controllers/programme',
			'controllers/settings',
			'controllers/search'
		]);

		/* 
		*	View live cycle 
		*/ 
		// When a Views start initializating triggers an event
		App.on(a.VIEW_INITIALIZING, function(view) { console.log('Canvas Module: VIEW_INITIALIZING', view.name); });
		// When a Views finish initializating triggers an event
		App.on(a.VIEW_INITIALIZED, function(view) { console.log('Canvas Module: VIEW_INITIALIZED', view.name); });
		// When a Views start rendering triggers an event
		App.on(a.VIEW_RENDERING, function(view) { console.log('Canvas Module: VIEW_RENDERING', view.name); });
		// When a Views finish rendering triggers an event
		App.on(a.VIEW_RENDERED, function(view) { console.log('Canvas Module: VIEW_RENDERED', view.name); });
		// When a Views start finalizing triggers an event
		App.on(a.VIEW_FINALIZING, function(view) { console.log('Canvas Module: VIEW_FINALIZING', view.name); });
		// When a Views finish finalizing triggers an event
		App.on(a.VIEW_FINALIZED, function(view) { console.log('Canvas Module: VIEW_FINALIZED', view.name); });

		App.on(a.CONTROLLER_INITIALIZING, function(view) { console.log('Canvas Module: CONTROLLER_INITIALIZATING', view.name); });
		App.on(a.CONTROLLER_INITIALIZED, function(view) { console.log('Canvas Module: CONTROLLER_INITIALIZATED', view.name); });
		App.on(a.CONTROLLER_FINALIZING, function(view) { console.log('Canvas Module: CONTROLLER_FINALIZATING', view.name); });
		App.on(a.CONTROLLER_FINALIZED, function(view) { console.log('Canvas Module: CONTROLLER_FINALIZED', view.name); });

		// listening the router
		App.on(a.NAVIGATE, navigate);
		// when any view is rendered,
		// remove transition
		App.on(a.VIEW_RENDERED, endTransition);

		return this;
	};

	/* destructor */
	function finalize() {

		App.off(a.NAVIGATE, navigate);
		App.off(a.VIEW_RENDERED, endTransition);

		App.off(a.VIEW_INITIALIZING, function(view) { console.log('Canvas Module: VIEW_INITIALIZING', view.name); });
		App.off(a.VIEW_INITIALIZED, function(view) { console.log('Canvas Module: VIEW_INITIALIZED', view.name); });
		App.off(a.VIEW_RENDERING, function(view) { console.log('Canvas Module: VIEW_RENDERING', view.name); });
		App.off(a.VIEW_RENDERED, function(view) { console.log('Canvas Module: VIEW_RENDERED', view.name); });
		App.off(a.VIEW_FINALIZING, function(view) { console.log('Canvas Module: VIEW_FINALIZING', view.name); });
		App.off(a.VIEW_FINALIZED, function(view) { console.log('Canvas Module: VIEW_FINALIZED', view.name); });

	};

/* export */

	return {
		name: 'canvas',
		initialize: initialize,
		finalize: finalize,
		controllers: controllers
	};

});