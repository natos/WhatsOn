/**
 *	LoginController
 */

define([

	/** @require */

	// utils
	'utils/metadata'

],


/**
 *	@class LoginController
 */

function(Metadata) {

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

		res.render('login.jade', {
			metadata	: metadata.get(),
			config		: _app.config,
			supports	: req.supports
		});

	};


	/** @return */

	return LoginController;

});