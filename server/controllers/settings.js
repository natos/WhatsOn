/**
 *	SettingsController
 */

define([

	/** @require */

	// utils
	'utils/metadata',

	// mocks
	'mocks/channels'

],


/**
 *	@class SettingsController
 */

function(Metadata) {

	/** @constructor */

	var SettingsController = function(app) {

		_app = app;

		// Routing

		app.server.get('/settings', this.render);
	};


	/** @private */

	var _app,

		metadata = new Metadata()

	/** @public */

	SettingsController.prototype.render = function(req, res) {

		var template = req.xhr ? 'contents/settings.jade' : 'layouts/settings.jade';

		res.render(template, {
			metadata	: metadata.get(),
			config		: _app.config,
			channels	: _app.channels,
			supports	: req.supports,
			xhr			: req.xhr
		});

	};


	/** @return */

	return SettingsController;

});