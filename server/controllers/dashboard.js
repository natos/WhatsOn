/**
 *	DashboardController
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
 *	@class DashboardController
 */

function(ChannelService, Supports, Metadata) {

	/** @constructor */

	var DashboardController = function(app) {

		_app = app;

		// Routing

		app.server.get('/', this.render);

	};


	/** @private */

	var _app;

	var ChannelService = new ChannelService();


	/** @public */

	DashboardController.prototype.render = function(req, res) {

		var supports = new Supports(req);

		var metadata = new Metadata();

		ChannelService.once('getChannels', function(error, response, body) {

			var channels = JSON.parse(body);

			res.render('dashboard.jade', {
				metadata	: metadata.get()
			,	config		: _app.config
			,	channels	: channels
			,	supportsCSSFixedPosition : supports.CSSFixedPosition() // I might want to expose the entire Supports object.
			});

		}).getChannels();

	}


	/** @return */

	return DashboardController;

});