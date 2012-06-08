/* 
* RouterModule 
* ------
* Using HTML5 pushState API with a little help of History.js (http://balupton.github.com/history.js/demo/)
*/

define([

	'config/app',
	'modules/app',
	'/js/lib/history/history.native.js'

], function RouterModuleScope(a, App) {

	var name = 'router';

/* private */

	var History = window.History,
		shift = Array.prototype.shift;

	function handleStateChange() {

		var State = History.getState(); // Note: We are using History.getState() instead of event.state
			State.parts = History.getShortUrl(State.url).match(/[\w\d-?\w\d]+/gi);
			State.controller = (State.parts) ? shift.apply(State.parts) : 'dashboard';

		App.emit(a.NAVIGATE, State);
	};


	/**
	 *	Listen to every click on #main, 
	 *	to override its default behavior
	 *	and use our own Router to navigate
	 */
	function handleAnchors(event) {
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
			navigate(anchor.dataset, anchor.title, anchor.href);
			// and prevent anchor's default behavior
			event.preventDefault();
			//console.log(anchor.dataset, anchor.title, anchor.href);
		}
		// else, ingnore
		// let the event continue
		// - "Bubble event! Bubble!"
	};

/* public */

	/* constructor */
	function initialize() {
		// Bind to StateChange Event
		History.Adapter.bind(window,'statechange', handleStateChange); 
		// Listen to every click on #main, 
		// to override its default behavior
		// and use our own Router to navigate
		a.$main.on('click', handleAnchors);
		// First load
		handleStateChange();
		return this;
	};

	/* destructor */
	function finalize() {
		// Unbind to StateChange Event
		History.Adapter.unbind(window,'statechange', handleStateChange); 
		return this;
	};

	function navigate(data, title, url) {
		History.pushState(data, title, url);
		return this;
	};

	// 31/05/2012 Natan: THIS IS NOT IN USE
	function navigateSilent(data, title, url) {
		History.replaceState(data, title, url);
		return this;
	};

/* export */

	return {
		name: name,
		initialize: initialize,
		navigate: navigate
	};

});