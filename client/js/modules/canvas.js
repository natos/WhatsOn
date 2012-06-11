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
	function startTransition() {
		console.log('Canvas Module','Adding transition;');
		a.$transition.appendTo(a.$body).removeClass('hide'); 
	};

	function endTransition() { 
		console.log('Canvas Module','Removing transition;');
		// wait half a sec to remove transition
		setTimeout(function() {
			a.$transition.addClass('hide'); 
			setTimeout(function() { 
				a.$transition.remove(); 
			}, 500); 
		}, 500);
	};


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

		if (typeof State === 'undefined') {
			console.log('Canvas Module', 'State object is empty. Stop navigation.');
			return;
		}

		if (State === CURRENT_STATE) {
			console.log('Canvas Module', State.name + ' controller already loaded.');
			return;
		}

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

		// listening the router
		App.on(a.NAVIGATE, navigate);
		// when any view is being initialized
		// add a transition state
		App.on(a.VIEW_INITIALIZING, startTransition);
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
		/* Controller live cycle 
		App.on(a.CONTROLLER_INITIALIZING, function(view) { console.log('Canvas Module', view.name, 'CONTROLLER_INITIALIZATING'); });
		App.on(a.CONTROLLER_INITIALIZED, function(view) { console.log('Canvas Module', view.name, 'CONTROLLER_INITIALIZATED'); });
		App.on(a.CONTROLLER_FINALIZING, function(view) { console.log('Canvas Module', view.name, 'CONTROLLER_FINALIZATING'); });
		App.on(a.CONTROLLER_FINALIZED, function(view) { console.log('Canvas Module', view.name, 'CONTROLLER_FINALIZED'); });
		*/
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