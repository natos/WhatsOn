/* 
* NavigationView
* --------------
* This view is permanently loaded and visible at the top of the page.
* It observes the VIEW_INITIALIZED global event, which is raised whenever a view is loaded.
* When a VIEW_INITIALIZED event is observed, the navigation control highlights the icon 
* associated with the view that has been loaded.
*
*/

define([

	'config/app',
	'modules/app',
	'lib/flaco/view'

], function NavigationView(a, App, View) {

	var name = 'navigation';

/* private */

	/**
	 * Handler for the VIEW_INITIALIZED application event
	 */
	function updateNavigation(State) {
		var anchor = $('.' + State.name);
		if (anchor[0]) {
			$('.nav a').removeClass('active');
			anchor.addClass('active');
		}
	};

	/**
	 * The Programme Grid is only available in the HTML5 rich app:
	 * this is where we create the navigation link for it.
	 */
	function addGridButton() {
		$('.nav').append('<a href="/grid" class="grid"><i class="icon-th"></i><b class="label">TV Gids</b></a>');
	};

/* public */

	/**
	 * Fake navigation
	 */
	function initialize() {

		App.on(a.VIEW_INITIALIZING, updateNavigation);

		return this;

	};

	function render() {
		// the grid is only supported by HTML5 browsers
		// I will assume your one of them ;)
		addGridButton();
	};

	function finalize() {

		App.off(a.VIEW_INITIALIZING, updateNavigation);

		return this;

	}

/* export */
	return new View({
		name: name,
		finalize: finalize,
		initialize: initialize
	})

});