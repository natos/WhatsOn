/**
 *	DashboardController
 */

define([

	/** @require */

	// services
	'services/channel',

	// utils
	'utils/supports',
	'utils/metadata'

],


/**
 *	@class DashboardController
 */

function(Channel, Supports, Metadata) {

	/** @constructor */

	var DashboardController = function(app) {

		_app = app;

		// Routing

		app.server.get('/', this.render);

	};


	/** @private */

	var _app,

		metadata = new Metadata(),

		ChannelService = new Channel();


	/** @public */

	DashboardController.prototype.render = function(req, res) {

		ChannelService.once('getChannels', function(error, response, body) {

			var channels = JSON.parse(body);

			res.render('dashboard.jade', {
				metadata	: metadata.get(),
				config		: _app.config,
				channels	: channels,
				supports	: req.supports
			});

		}).getChannels();

	};


	/** @return */

	return DashboardController;

});