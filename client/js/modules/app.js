/* 
* AppModule 
* ---------
*
* Control the app
*
*/

define([

	'config/app',
	'config/channel',
	'modules/event',
	'modules/schedule',
	'models/app',
	'models/channel',
	'models/grid',
	'models/user'

], function AppModuleScope(a, c, Event, Schedule, AppModel, ChannelModel, GridModel, UserModel) {

/* private */
	
	var shift = Array.prototype.shift,

		// Global namespace
		App = {};

	// whenever your ready
	// start modules
	Event.on(a.READY, loadModules);

	// initialize modules
	function initializer() { while (module = shift.apply(arguments)) { App.modules[module.name] = module.initialize(); } }

/* public */

	/* Modules namespace */
	App.modules = {};

	/* constructor */	

	function initialize() {

		require(['modules/schedule'], initializer);

		return App;
	
	}

	function loadModules() {

		// Load the primary modules for the app.
		// Each module must have an "initialize" method that returns the module instance.
		require(['modules/user','modules/canvas', 'modules/router'], initializer);

		return App;
	}

	/**
	 * Whether the grid is available. Not all HTML5 browsers are capable
	 * of displaying the grid. We enable/disable grid based on user agent
	 * detection. Horrible, I know. But feature detection for "good" CSS fixed position
	 * is hard.
	 *
	 * The HTML5 app is only initialized if the user agent passes the Mustard test,
	 * so that eliminates a lot of user agents. This function should act as an additional
	 * filter to reject user agents that *are* HTML5-capable, but nevertheless don't
	 * support CSS fixed positioning:
	 *
	 * - iOS < 5
	 * - Android browser < 2.3
	 */
	function allowGrid() {
		var blacklist = "(Android 1\.5)|(Android 1\.6)|(Android 2\.1)|(Android 2\.2)"; // Exclude Android browser before 2.3
			+ "|(CPU OS|iPhone OS) (1|2|3|4)" // Exclude Mobile Safari on iOS before 5.0
		var blacklistRE = new RegExp(blacklist);

		return !blacklistRE.test(navigator.userAgent);
	}

	/**
	* Android 2.x does not apply 3D transformations to position:fixed elements.
	* Use this test for adding an extra className to the root element.
	*/
	function can3DTransformPositionFixed() {
		var blacklist = "(Android 1\.5)|(Android 1\.6)|(Android 2\.1)|(Android 2\.2)|(Android 2\.3)"; // Exclude Android browser 2.3 and earlier
		var blacklistRE = new RegExp(blacklist);
		return !blacklistRE.test(navigator.userAgent);
	}

	/* public */

	App.name = 'UPC Social';
	App.initialize = initialize;
	App.events = Event;
	App.models = {
		app 	: AppModel, 
		channel	: ChannelModel, 
		grid 	: GridModel,
		user	: UserModel
	}
	App.allowGrid = allowGrid();
	App.can3DTransformPositionFixed = can3DTransformPositionFixed;
	App.selectedLanguageCode = 'nl';

	window.app = App;

	return App;

});