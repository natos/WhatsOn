define([

	'config/app',
	'views/settings'

], function(c, SettingsView) {

/* private */

/* @class SettingsView */
var SettingsController = {};

	/* constructor */
	SettingsController.initialize = function() {

		this.view = SettingsView.initialize();

		return this;

	};

	return SettingsController;

});