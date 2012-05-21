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
	App.modules = {};


	/* constructor */
	function initialize() {

		// Load the primary modules for the app.
		// Each module must have an "initialize" method that returns the module itself.
		lazyLoadModules(['modules/router', 'modules/canvas', 'modules/navigation', 'modules/user']);

		return this;
	
	};

	// initialize a collection of modules
	function initializeModules() {
		while (module = Array.prototype.shift.apply(arguments)) { 
			App.modules[module.name] = module.initialize();
		} 
	};

	// require and load modules
	function lazyLoadModules(modules) {
		require(modules, initializeModules);
	};


	/* public */

	App.name = 'UPC Social';
	App.initialize = initialize;

	return App;

});