/* 
* RouterModule 
* ------
* Using HTML5 pushState API with a little help of History.js (http://balupton.github.com/history.js/demo/)
*/

define([

	'/js/lib/history/history.native.js',
	'config/app',
	'modules/app'

], function(History, a, App) {

	var name = 'router';

/* private */

	var History = window.History,
		shift = Array.prototype.shift;

	function handleStateChange() {

		var State = History.getState(); // Note: We are using History.getState() instead of event.state
			State.parts = History.getShortUrl(State.url).match(/[\w\d-?\w\d]+/gi);
			State.controller = (State.parts) ? shift.apply(State.parts) : 'dashboard';
console.log(State);
		App.emit(a.NAVIGATE, State);
	};

/* public */

	/* constructor */
	function initialize() {
		// Bind to StateChange Event
		History.Adapter.bind(window,'statechange', handleStateChange); 
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