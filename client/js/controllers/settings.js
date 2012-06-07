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
	'lib/flaco/controller',
	'views/settings'

], function SettingsController(c, App, Controller, SettingsView) {

	var name = 'settings';

/* private */

/* public */

	function initialize() {
	
		return this;
	
	};

	function finalize() {

		return this;

	};

/* export */

	return {
		name: name,
		initialize: initialize,
		finalize: finalize,
		view: SettingsView
	};

});