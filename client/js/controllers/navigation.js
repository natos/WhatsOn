/* 
* NavigationController
* ----------------
*/

define([

	'config/app',
	'modules/app',
	'components/search',
	'views/navigation'

], function NavigationModule(appConfig, App, Search, NavigationView) {

	/**
	 * Load the content for the view.
	 * Activate associated components.
	 * Set up event handlers.
	 * @public
	 */
	function initialize() {

		NavigationView.initialize();
		Search.initialize();

		return this;

	};

	/**
	 * If necessary, remove the content for the view from the DOM.
	 * Deactivate associated components. 
	 * Clean up event handlers.
	 * @public
	 */
	function finalize() {

		NavigationView.finalize();

	};

	/* public */
	return {
		name: 'navigation',
		initialize: initialize,
		finalize: finalize,
		view: NavigationView
	};

});