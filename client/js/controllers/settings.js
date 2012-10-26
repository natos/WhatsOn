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
	'models/app',
	'modules/app',
	'modules/event',
	'views/settings',
	'lib/flaco/controller',
	'lib/cookie/cookie'

], function SettingsController(a, AppModel, App, Event, SettingsView, Controller, cookie) {

	var name = 'settings';

/* private */

	/* Handle data changes */
	
	Event.on(a.SELECTED_COUNTRY, function(country) {
		// set the selected country
		// on the AppModel
		AppModel.set(a.SELECTED_COUNTRY, country);
		// save selection on a cookie
		// for future reference
		cookie.set(a.SELECTED_COUNTRY, country);
	});


/* public */

	function initialize() {

		return this;
	
	}

	function finalize() {

		return this;

	}

/* export */

	return new Controller({
		name		: name,
		initialize	: initialize,
		finalize	: finalize,
		view		: SettingsView
	});

});