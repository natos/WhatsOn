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
	'modules/router',
	'lib/flaco/view'

], function NavigationView(a, App, Router, View) {

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

	/**
	 *	Listen to every click on #main, 
	 *	to override its default behavior
	 *	and use our own Router to navigate
	 */
	function routeAnchors(event) {
		// save the click target
		var anchor = event.target;
		// Keep bubbling up through DOM until you find an anchor,
		// you might have clicked the icon or the label element,
		// and not the proper <a> tag
		while (!anchor.href) {
			// break if the #main is reachead
			if (anchor === this) { break; }
			// step up in the DOM to the next parent
			anchor = anchor.parentNode;
		}

		// if an anchor was found, just navigate to it
		if (anchor.href) {
			// grab its data-*, title, and href attr
			// and pass everithing to the router, he will pushState and whatever
			Router.navigate(anchor.dataset, anchor.title, anchor.href);
			// and prevent anchor's default behavior
			event.preventDefault();
			//console.log(anchor.dataset, anchor.title, anchor.href);
		}
		// else, ingnore
		// let the event continue
		// - "Bubble event! Bubble!"
	};

/* public */

	/**
	 * Fake navigation
	 */
	function initialize() {

		// the grid is only supported by HTML5 browsers
		// I will assume your one of them ;)
		addGridButton();

		App.on(a.VIEW_INITIALIZING, updateNavigation);

		// Listen to every click on #main, 
		// to override its default behavior
		// and use our own Router to navigate
		//a.$main.on('click', routeAnchors);

		return this;

	};

	function finalize() {

		App.off(a.VIEW_INITIALIZING, updateNavigation);

		return this;

	}

/* export */
	return {
		name: name,
		finalize: finalize,
		initialize: initialize
	}

});