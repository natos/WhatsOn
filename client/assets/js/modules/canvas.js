/* 
* CanvasModule
* ----------------
* This module is responsible for dealing with the main area of the page (the "canvas").
* When a client-side navigation event occurs, the correct view should be displayed.
*/

define([

	'config/app',
	'modules/router'

], function CanvasModule(appConfig, Router) {

	/* private */

	var _controllers = {},
		_currentController;

	/**
	 * Set up event handlers.
	 * @public
	 */
	function initialize() {

		upc.on(appConfig.NAVIGATE, activateController);

		upc.on(appConfig.VIEW_LOADED, hideLoading);

		loadControllers ([
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

	/**
	 * Clean up event handlers.
	 * Reset the list of controllers.
	 * @public
	 */
	function finalize() {

		_controllers = {};
		_currentController = null;
		upc.off(appConfig.VIEW_LOADED, hideLoading);
		upc.off(appConfig.NAVIGATE, activateController);

	};

	/**
	 * Load the code for all controllers.
	 * @private
	 */
	function loadControllers(controllers) {
		require(controllers, function(){
			var controller,
				i,
				controllersCount = arguments.length;
			for (i=0; i< controllersCount; i++) {
				controller = arguments[i];
				if (controller && typeof(controller.name)==='string' && typeof(controller.initialize)==='function') {
					_controllers[controller.name] = controller;
				}
			}

			Router.evaluateLocation();

		});
	};

	/**
	 * Hide the "loading" message.
	 * @private
	 */
	function hideLoading() {
		$('#transition').hide();
	};

	/**
	 * Activate a controller for the canvas
	 * @private
	 */
	function activateController(controllerName, params) {
		// Default controller
		if (controllerName==='') {
			controllerName = 'dashboard';
		}

		var controller = _controllers[controllerName];
		if (controller && typeof(controller.initialize)==='function') {
			$('#transition').show();
			deactivateController(_currentController);
			controller.initialize(params);
			_currentController = controller;
		}

	};

	/**
	 * Deactivate a controller for the canvas
	 * @private
	 */
	function deactivateController(controller) {
		if (controller && typeof(controller.finalize)==='function') {
			controller.finalize();
		}
	};


	/* public */
	return {
		name: 'canvas',
		initialize: initialize,
		finalize: finalize
	};

});