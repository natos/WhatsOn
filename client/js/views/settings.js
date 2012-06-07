/* 
* SettingsView
* --------------
*
* Controlls settings page
*
*/

define([

	'config/app',
	'modules/app',
	'lib/flaco/view'

], function SettingsView(a, App, View) {

/* private */

	/* constructor */
	function initialize() {

		/** 
		*	Events handlers
		*/

		App.emit(a.VIEW_RENDERED, this);

		return this;

	};


/* @class SettingsView */
	return {
		initialize: initialize
	}

});