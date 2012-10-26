/**
 *	NowAndNextController
 */

define([

	/** @require */

	// utils
	'utils/metadata',

	'config/global.config'

],


/**
 *	@class NowAndNextController
 */

function(Metadata, config) {

	/** @constructor */

	var NowAndNextController = function(app) {

		_app = app;

		// Routing

		app.server.get('/nowandnext', this.renderEmpty);

	};


	/** @private */

	var _app,

		metadata = new Metadata();


	/** @public */

	NowAndNextController.prototype.renderEmpty = function(req, res) {
		var template = req.xhr ? 'contents/empty-content.jade' : 'layouts/empty-layout.jade';

		res.render(template, {
			metadata	: metadata.get(),
			config		: _app.config,
			supports	: req.supports,
			xhr			: req.xhr
		});
	};

	/** @return */

	return NowAndNextController;

});