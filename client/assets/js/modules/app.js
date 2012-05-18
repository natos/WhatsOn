/* 
* AppModule 
* ---------
*
* Control the app
*
*/

define([

	'/assets/js/lib/event/event.js',
	'config/app'

], function AppModule(EventEmitter, c) {

/* private */

	/* App extends EventEmitter */
	var App = new EventEmitter();
		/* Modules namespace */
		App.modules = [];


	/* constructor */
	function initialize() {
	
		// cutting the mustard TODO: move this to main.js, and load zepto for mustard and jquery for mayo
		this.mustard = ('querySelector' in document && 'localStorage' in window && 'addEventListener' in window);

		if (!this.mustard) {
			throw('Initialization aborted! Cutting the mustard. Get a new browser dude!');
		}

		// load modules
		lazyLoadModules(['modules/router', 'modules/canvas', 'modules/navigation', 'modules/user']);

		return this;
	
	};

	// initialize a collection of modules
	function initializeModules() {
		while (module = Array.prototype.shift.apply(arguments)) { 
			App[module.name] = module.initialize();
		} 
	};

	// require and load modules
	function lazyLoadModules(modules) {
		require(modules, initializeModules);
	};

/* public */

	/* constructor */
	App.name = 'UPC Social';
	App.initialize = initialize;

	return App;

});