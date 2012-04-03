/**
 *	GridController
 */

define([

	/** @require */

	// services
	'services/channel'

	// utils
,	'utils/supports'

],


/**
 *	@class GridController
 */

function(ChannelService, Supports) {

	/** @constructor */

	var GridController = function(app) {

		_app = app;

		// Routing

		app.server.get('/grid', this.render);

	};


	/** @private */

	var _app;

	var ChannelService = new ChannelService();


	/** @public */

	GridController.prototype.render = function(req, res) {

		var supports = new Supports(req);

		ChannelService.once('getChannels', function(error, response, body) {

			var channels = JSON.parse(body);

			res.render('grid.jade', {
				metadata	: _app.metadata()
			,	config		: _app.config
			,	channels	: channels
			,	supportsCSSFixedPosition : supports.CSSFixedPosition() // I might want to expose the entire Supports object.
			});

		}).getChannels();

	}

	/** @return */

	return GridController;

});