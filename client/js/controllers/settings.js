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
	'lib/flaco/controller',
	'views/settings'

], function SettingsController(a, AppModel, App, Event, Controller, SettingsView) {

	var name = 'settings';

/* private */

	/* Handle data changes */
	Event.on(a.MODEL_CHANGED, function(changes) {

		// Once we got countries information
		if (changes[a.COUNTRIES_CACHE]) {

		}

	});

	Event.on(a.SELECTED_COUNTRY, function(country) {
		
		// set the selected country on the AppModel
		AppModel.set(a.SELECTED_COUNTRY, country)

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