/* 
* AppModule 
* ---------
*
* Control the app
*
*/

define([

	'/js/lib/event/event.js',
	'config/app'

], function AppModuleScope(EventEmitter, c) {

	/* private */

	/* App extends EventEmitter */
	var App = new EventEmitter();

	/* Modules namespace */
	App.modules = {};

	/* Templates namespace */
	App.templates = {};

	/* The app holds an array of channels, but this array is empty
	  when the app initializes. If a component wants to access the
	  channels, it should first call App.populateChannels to
	  ensure that the array is full before using it. If the array
	  was empty, this will invoke an ajax request to get the list.
	 */
	App.channels = [];


	/* constructor */
	function initialize() {

		// Load the primary modules for the app.
		// Each module must have an "initialize" method that returns the module itself.
		require(['modules/user', 'modules/canvas', 'modules/router'], function initializeModules() {
			while (module = Array.prototype.shift.apply(arguments)) { App.modules[module.name] = module.initialize(); } 
		});

		return this;
	
	}

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
				window.channels = App.channels;
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