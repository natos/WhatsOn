/**
 *	SettingsController
 */

define([

	/** @require */

	// utils
	'utils/metadata'

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

		res.render('settings.jade', {
			metadata	: metadata.get(),
			config		: _app.config,
			supports	: req.supports
		});

	};


	/** @return */

	return SettingsController;

});