/**
 *	LoginController
 */

define([

	/** @require */

	// utils
	'utils/metadata',

	// mocks
	'mocks/channels'

],


/**
 *	@class LoginController
 */

function(Metadata, Channels) {

	/** @constructor */

	var LoginController = function(app) {

		_app = app;

		// Routing

		app.server.get('/login', this.render);
	};


	/** @private */

	var _app,

		metadata = new Metadata()

	/** @public */

	LoginController.prototype.render = function(req, res) {

		var template = req.xhr ? 'contents/login.jade' : 'layouts/login.jade';

		res.render(template, {
			metadata	: metadata.get(),
			config		: _app.config,
			channels	: _app.channels,
			supports	: req.supports,
			xhr			: req.xhr
		});

	};


	/** @return */

	return LoginController;

});