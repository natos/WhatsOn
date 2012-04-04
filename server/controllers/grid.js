/**
 *	GridController
 */

define([

	/** @require */

	// services
	'services/channel'

	// utils
,	'utils/supports'
,	'utils/metadata'

],


/**
 *	@class GridController
 */

function(ChannelService, Supports, Metadata) {

	/** @constructor */

	var GridController = function(app) {

		_app = app;

		// Routing

		app.server.get('/grid.html', this.render);

	};


	/** @private */

	var _app;

	var ChannelService = new ChannelService();


	/** @public */

	GridController.prototype.render = function(req, res) {

		var supports = new Supports(req);

		var metadata = new Metadata();

		ChannelService.once('getChannels', function(error, response, body) {

			var channels = JSON.parse(body);

			res.render('grid.jade', {
				metadata	: metadata.get()
			,	config		: _app.config
			,	channels	: channels
			,	supports 	: req.supports
			});

		}).getChannels();

	}

	/** @return */

	return GridController;

});