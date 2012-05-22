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

	/* The app holds an array of channels */
	App.channels = [];


	/* constructor */
	function initialize() {

		// Load the primary modules for the app.
		// Each module must have an "initialize" method that returns the module itself.
		loadModules(['modules/router', 'modules/canvas', 'modules/user', 'controllers/navigation']);

		return this;
	
	};

	// initialize a collection of modules
	function initializeModules() {
		while (module = Array.prototype.shift.apply(arguments)) { 
			App.modules[module.name] = module.initialize();
		} 
	};

	// require and load modules
	function loadModules(modules) {
		require(modules, initializeModules);
	};

	/**
	 * Populate the list of channels, and call a callback when they're ready
	 * @public
	 */
	function populateChannels(callback) {
		if (this.channels && this.channels.length > 0) {
			callback();
		} else {
			$.getJSON('/channels.json', function(data, status, xhr){
				App.channels = data;
				callback();
			});
		}
	}

	function loadCss(url) {
		var link = document.createElement("link");
		link.type = "text/css";
		link.rel = "stylesheet";
		link.href = url;
		document.getElementsByTagName("head")[0].appendChild(link);
	}


	/* public */

	App.name = 'UPC Social';
	App.initialize = initialize;
	App.populateChannels = populateChannels;
	App.loadCss = loadCss;

	return App;

});