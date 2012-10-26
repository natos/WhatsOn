/*
* RouterModule
* ------
* Using HTML5 pushState API with a little help of History.js: 
* http://balupton.github.com/history.js/demo/
*/

define([

	'config/app',
	'models/app',
	'modules/app',
	'modules/event',
	'utils/dom',
	'lib/history/1.7.1-r2/bundled/html4+html5/native.history'

], function RouterModuleScope(a, AppModel, App, Event, dom) {

	var name = 'router',

/* private */

	// consts

		STATECHANGE = 'statechange',

	// shorcuts

		// Localize global History Object
		History = window.History,

		shift = Array.prototype.shift,

		slice = Array.prototype.slice;

	/**
	*	Handle State Changes
	*/
	function handleStateChange() {

		// Creates the State Object
		var State = History.getState(), // Note: We are using History.getState() instead of event.state
			path = History.getShortUrl(State.url);

		console.log('<ROUTER> handleStateChange', State, path);
		// Remove the initial '/' from the path
		if (path.slice(0,1)==='/') {
			path = path.slice(1);
		}

		// In some cases (Android 4.0.x), History.js returns a value starting with './'
		// We don't want that, either:
		if (path.slice(0,2)==='./') {
			path = path.slice(2);
		}

		// Split the URL path (without protocol, hostname & port)
		// into an array of strings. Split on path separator ('/'),
		// querystring separators ('?', '&', '='), fragment separators,
		State.parts = path.split(/[\/\?\&=\#]/gi);

		// The controller to be loaded is the first element in the parts array
		// Return dashboards if is empty
		State.controller = (State.parts) ? shift.apply(State.parts) : 'dashboard';

		// Normal flow
		Event.emit(a.NAVIGATE, State);
	}

	/**
	*	Activate anchors
	*/
	function activeAnchors(State) {
		// get the selected anchor
		var anchor = dom.doc.querySelectorAll('.' + State.name);
		// if the selected anchor exist
		if (anchor[0]) {
			// deselect all the anchors
			slice.call(dom.doc.querySelectorAll('.nav a'), 0)
				.forEach(function(e) { 
					e.className = e.className.replace('active',''); 
				});
			// make the selected anchor active
			anchor[0].className = anchor[0].className += ' active';
		}
	}

	/**
	*	Listen to every click on #main,
	*	to override its default behavior
	*	and use our own Router to navigate
	*/
	function handleAnchors(event) {

		// save the click target
		var element = anchor = event.target,

		// Find actions on clicked elements, this
		// actions are declared on the data-action
		// attribute, its value defines the action
		// to be trigger.
			dataset = dom.getDataset(element);

		while (!dataset.action) {
			// break if the #main is reached
			if (element === this) { break; }
			// walk up the DOM
			element = element.parentNode;
			dataset = dom.getDataset(element);
		}

		// found a data-action attribute?
		if (dataset.action) {
			//trigger the action, send event object
			Event.emit(a.ACTION, dataset.action, event);
		}

		// an action can prevent default
		// from its own handler context
		// in that case, stop processing
		if (event.defaultPrevented) {
			return;
		}

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
			// and prevent anchor's default behavior
			event.preventDefault();
			// grab its data-*, title, and href attr
			// and pass everithing to the router, he will pushState and whatever
			dataset = dom.getDataset(anchor);
			// pushState to history
			navigate(dataset, anchor.title, anchor.href);
			// let know everyone that we are navigating
			Event.emit(a.ACTION, a.NAVIGATE);
		}

		// else, trigger an void action event it is
		// used as empty click event to hide stuff
		// or act when the users click nothing
		if (!dataset.action && !anchor.href) {
			// trigger void action
			Event.emit(a.ACTION, a.VOID);
		}

		// let the event continue
		// - "Bubble event! Bubble!"
	}

/* public */

	function initialize() {

		// Bind to StateChange Event
		History.Adapter.bind(window, STATECHANGE, handleStateChange);

		// Active links
		Event.on(a.VIEW_INITIALIZING, activeAnchors);
		// Listen to every click on #main,
		// to override its default behavior
		// and use our own Router to navigate
		dom.main.addEventListener('click', handleAnchors, false);

		handleStateChange();

		return this;
	}

	function finalize() {
		// Unbind to StateChange Event
		History.Adapter.unbind(window, STATECHANGE, handleStateChange);
		// stop activating links
		Event.off(a.VIEW_INITIALIZING, activeAnchors);

		dom.main.removeEventListener('click', handleAnchors, false);

		return this;
	}

	function redirect(name) {
		navigate({}, name, '/' + name);
		return this;
	}

	function navigate(data, title, url) {
		History.pushState(data, title, url);
		console.log('<ROUTER> navigate', data, title, url);
		return this;
	}

	// 31/05/2012 Natan: THIS IS NOT IN USE
	function navigateSilent(data, title, url) {
		History.replaceState(data, title, url);
		return this;
	}

/* export */

	return {
		name		: name,
		initialize	: initialize,
		navigate	: navigate,
		back		: History.back,
		go 			: History.go
	};

});