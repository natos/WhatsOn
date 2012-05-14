/* 
* AppController 
* -------------
*
* Control the app
*
*/

define([

	'/assets/js/lib/event/event.js',
	'config/app',
	'controllers/user',
	'components/grid',
	'components/search'

], function AppController(EventEmitter, c, UserController, Grid, Search) {

	/* App extends EventEmitter */
	var App = new EventEmitter();

	/* global signature */
	window.upc = App;

/* private */

	/* constructor */
	function initialize() {
	
		// cutting the mustard TODO: move this to main.js, and load zepto for mustard and jquery for mayo
		this.mustard = ('querySelector' in document && 'localStorage' in window && 'addEventListener' in window);
	
		// start navigation
		navigation();

		// transitions
		transitionHandler();

		// load modules
		loadModules();

		return this;
	
	};

	// global events, every view loaded, remove transition
	function transitionHandler() {
		var transition = $('#transition');
		App.on(c.VIEW_LOADED, function(event) {
			transition.addClass('hide');
			setTimeout(function() { transition.remove(); }, 500);
		});
	};

	// auto load modules, will search for all <script data-load="...">, try to load and call the initialize method
	function loadModules() {
		var scripts = [], module;
		$('script[data-load]').each(function(i, e) { scripts.push($(e).data('load')); });
		require(scripts, function() { 
			while (module = Array.prototype.shift.apply(arguments)) { module.initialize(); } 
		});
	}
	
	// auto select the navigation menu
	function navigation() {
	
		var nav = $('.nav'), path = window.location.pathname;
	
		if (path === "/") { $('.home').addClass('active'); return; }
	
		nav.find('a').each(function(index, item) {
			if (this.href.toString().indexOf(path)>-1) { 
				$(this).addClass('active'); 
				return; 
			}
		});
	
	};

/* public */

	/* constructor */
	App.initialize = initialize;

	/* global components */
	App.components = {
		grid: Grid.initialize(),
		search: Search.initialize()
	};
	/* controllers */
	App.controllers = {
		user: UserController.initialize()
	};

	return App;

});