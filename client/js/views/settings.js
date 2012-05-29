/* 
* SettingsView
* --------------
*
* Controlls settings page
*
*/

define([

	'config/app',
	'modules/app'

], function SettingsView(c, App) {

/* private */

	/* constructor */
	function initialize() {

		/** 
		*	Events handlers
		*/

		App.emit(c.VIEW_LOADED, this);

		return this;

	};


/* @class SettingsView */
	return {
		initialize: initialize
	}

});