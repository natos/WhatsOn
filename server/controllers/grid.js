/**
 *	GridController
 */

define([

	/** @require */

	// services
	'services/channel',

	// utils
	'utils/metadata',

	// mocks
	'mocks/channels'

],


/**
 *	@class GridController
 */

function(ChannelService, Metadata, Channels) {

	/** @constructor */

	var GridController = function(app) {

		_app = app;

		// Routing

		app.server.get('/grid', this.render);

	};


	/** @private */

	var _app,

		metadata = new Metadata();


	/** @public */

	GridController.prototype.render = function(req, res) {

		var template = req.xhr ? 'contents/grid.jade' : 'layouts/grid.jade'

		res.render(template, {
			metadata	: metadata.get(),
			config		: _app.config,
			channels	: _app.channels,
			timebar		: new Array(24),
			supports	: req.supports
		});

	};

	/** @return */

	return GridController;

});