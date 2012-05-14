/* 
* SettingsController 
* --------------
*
* Listen to the views
* Updates the model
*
*/

define([

	'config/app',
	'controllers/app',
	'views/settings'

], function SettingsController(c, App, SettingsView) {

/* private */

	function initialize() {

		// Let the App know your here
		App.controllers.settings = this;
	
		return this;
	
	};

/* public */
	return {
		/* constructor */
		initialize: initialize,
		view: SettingsView.initialize()
	};

});