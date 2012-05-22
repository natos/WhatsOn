/* 
* NavigationView
* --------------
* This view is permanently loaded and visible at the top of the page.
* It observes the VIEW_LOADED global event, which is raised whenever a view is fully loaded.
* When a VIEW_LOADED event is observed, the navigation control highlights the icon 
* associated with the view that has been loaded.
*
*/

define([

	'config/app',
	'modules/app'

], function NavigationView(appConfig, App) {

	/**
	 * Load the content for the view.
	 * Activate associated components.
	 * Set up event handlers.
	 * @public
	 */
	function initialize() {

		$('.navbar').on('click', 'a', function(e) {
			var appUrl = this.getAttribute('data-appurl');
			if (appUrl) {
				location.href = appUrl;
				e.preventDefault();
			}
		});

		App.on(appConfig.VIEW_LOADED, updateNavigation);

		// initial navigation
		updateNavigation();

		return this;

	};

	/**
	 * If necessary, remove the content for the view from the DOM.
	 * Deactivate associated components. 
	 * Clean up event handlers.
	 * @public
	 */
	function finalize() {

		$('navbar').off('click');
		App.off(appConfig.VIEW_LOADED, updateNavigation);

	}

	/**
	 * Handler for the VIEW_LOADED application event
	 * @private
	 */
	function updateNavigation(viewName) {

		$('.nav a').each(function(index, item) {
			var appUrl = this.getAttribute('data-appurl');
			$(this).toggleClass('active', (appUrl && appUrl.indexOf(viewName)>-1) );
		});	
	};


	/* @class NavigationView */
	return {
		initialize: initialize,
		finalize: finalize
	}

});