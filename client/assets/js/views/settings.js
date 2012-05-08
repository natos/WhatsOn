define([

	'config/app'

], function(c) {

/* private */

/* @class SettingsView */
var	SettingsView = {};

	/* constructor */
	SettingsView.initialize = function() {

		// Let the App know your here
//		App.views.settings = this;

		/** 
		*	Events handlers
		*/

		setTimeout( function() { upc.emit(c.VIEW_LOADED, this); }, 300);

		return this;

	};

	return SettingsView;

});