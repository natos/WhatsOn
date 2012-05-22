/* 
* DashboardView
* -------------
*
*/

define([

	'config/app',
	'modules/app',
	'components/carousel'

], function DashboardView(a, App, Carousel) {

	/**
	 * Load the content for the view. 
	 * Activate associated components. 
	 * Set up event handlers.
	 * @public
	 */
	function initialize() {
		if ($('#content').find('#content-dashboard').length>0) {
			// Dashboard content is already loaded
			initializeComponents();
		} else {
			// Get dashboard content from server
			$('#content').load('/dashboard #content', function(data, status, xhr){
				initializeComponents();
			});
		}

		App.emit(a.VIEW_LOADED, 'dashboard');

		return this;
	
	};

	/**
	 * Activate sub-components of the view
	 * @private
	 */
	function initializeComponents() {
		this.components = {
			carousel: Carousel.initialize('#featured')
		};
	};

	/**
	 * If necessary, remove the content for the view from the DOM.
	 * Deactivate associated components. 
	 * Clean up event handlers.
	 * @public
	 */
	function finalize() {
		finalizeComponents();
	};

	/**
	 * Deactivate associated components. 
	 * @private
	 */
	function finalizeComponents() {
		var carousel = this.components.carousel;
		if (carousel && typeof(carousel.finalize)==='function') {
			carousel.finalize();
		}
	};


	/* @class DashboardView */
	return {
		initialize: initialize,
		finalize: finalize
	};

});