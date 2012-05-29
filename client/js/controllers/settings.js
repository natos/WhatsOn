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
	'modules/app',
	'views/settings'

], function SettingsController(c, App, SettingsView) {

/* private */

	function initialize() {
	
		return this;
	
	};

/* public */
	return {
		name: 'settings',
		/* constructor */
		initialize: initialize,
		view: SettingsView
	};

});