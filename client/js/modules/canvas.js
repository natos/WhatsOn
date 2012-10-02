/* 
* CanvasModule
* ----------------
*
*
*/

define([

	'config/app',
	'config/user',
	'modules/app',
	'modules/event',
	'modules/router'

], function CanvasModuleScope(a, u, App, Event, Router) {

	var name = 'canvas',

/* private */

	// shift
		shift = Array.prototype.shift,
		// DOM
		_main = a._doc.getElementById('main'),
		_menu = a._doc.getElementsByTagName('nav')[0],
		// current state
		CURRENT_STATE = false,
		// constants
		INITIALIZE = 'initialize',
		FINALIZE = 'finalize';

	/*
	*	Transition
	*/
	function startTransition() {
		var transitionElement = document.getElementById('transition');
		var loadingElement;
		if (!transitionElement) {
			transitionElement = document.createElement('div');
			transitionElement.id = 'transition';
			loadingElement = document.createElement('div');
			loadingElement.className = 'loading';
			transitionElement.appendChild(loadingElement);
			a._content.appendChild(transitionElement);
		}
		transitionElement.className = 'background';
	}

	function endTransition() {
		var transitionElement = document.getElementById('transition');
		if (transitionElement) {
			transitionElement.className = 'background hide';

			setTimeout(function removeTransition() {
				if (transitionElement && transitionElement.parentNode) {
					transitionElement.parentNode.removeChild(transitionElement);
				}
			}, 500);
		}
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
		require([controller], function mapController(controller) {
			controllers[controller.name] = controller;
			intializeController(controller);
		});
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

		// If the grid is not allowed, redirect to dashboard.
		if (State.controller === 'grid' && !App.allowGrid()) {
			Router.navigate({}, '', '/dashboard');
			return;
		}

		unloadController(CURRENT_STATE);
		loadController(State);
		closeMenu();

	}

	function handleActions(action, dataset) {
		switch (action) {
			case 'TOGGLE-MENU': 
				toggleMenu(); break;
		}
	}

	function toggleMenu() {
		if (/open/.test(_main.className)) {
			closeMenu();
		} else {
			openMenu();
		}
		console.log(_menu.className);
	}

	function openMenu() {
		_main.className = 'open';
		_menu.className = 'nav active';
	}

	function closeMenu() {
		_main.className = '';
		_menu.className = 'nav';
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
		Event.on(a.NAVIGATE, startTransition);
		// and when finish rendereding,
		// remove transition
		Event.on(a.VIEW_RENDERED, endTransition);
		// Listen for action
		Event.on(a.ACTION, handleActions);
		// DEBUGGING Handlers
		/* View live cycle
		Event.on(a.VIEW_INITIALIZING, function(view) { console.log('Canvas Module', view.name, 'VIEW_INITIALIZING'); });
		Event.on(a.VIEW_INITIALIZED, function(view) { console.log('Canvas Module', view.name, 'VIEW_INITIALIZED'); });
		Event.on(a.VIEW_RENDERING, function(view) { console.log('Canvas Module', view.name, 'VIEW_RENDERING'); });
		Event.on(a.VIEW_RENDERED, function(view) { console.log('Canvas Module', view.name, 'VIEW_RENDERED'); });
		Event.on(a.VIEW_FINALIZING, function(view) { console.log('Canvas Module', view.name, 'VIEW_FINALIZING'); });
		Event.on(a.VIEW_FINALIZED, function(view) { console.log('Canvas Module', view.name, 'VIEW_FINALIZED'); });
		*/
		/* Controller live cycle
		Event.on(a.CONTROLLER_INITIALIZING, function(view) { console.log('Canvas Module', view.name, 'CONTROLLER_INITIALIZATING'); });
		Event.on(a.CONTROLLER_INITIALIZED, function(view) { console.log('Canvas Module', view.name, 'CONTROLLER_INITIALIZATED'); });
		Event.on(a.CONTROLLER_FINALIZING, function(view) { console.log('Canvas Module', view.name, 'CONTROLLER_FINALIZATING'); });
		Event.on(a.CONTROLLER_FINALIZED, function(view) { console.log('Canvas Module', view.name, 'CONTROLLER_FINALIZED'); });
		*/

		if (!App.can3DTransformPositionFixed()) {
			document.documentElement.className += ' css-no-3d-transform-position-fixed';
		}
		return this;
	}

	/* destructor */
	function finalize() {

		Event.off(a.NAVIGATE, navigate);
		Event.off(a.NAVIGATE, startTransition);
		Event.off(a.VIEW_RENDERED, endTransition);
		Event.off(a.ACTION, manageActions);

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