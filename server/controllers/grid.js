/**
 *	GridController
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
 *	@class GridController
 */

function(Channel, Supports, Metadata) {

	/** @constructor */

	var GridController = function(app) {

		_app = app;

		// Routing

		app.server.get('/grid.html', this.render);

	};


	/** @private */

	var _app,

		metadata = new Metadata(),

		ChannelService = new Channel();


	/** @public */

	GridController.prototype.render = function(req, res) {

		ChannelService.once('getChannels', function(error, response, body) {

			var channels = JSON.parse(body);

			res.render('grid.jade', {
				metadata	: metadata.get(),
				config		: _app.config,
				channels	: channels,
				supports	: req.supports
			});

		}).getChannels();

	};

	/** @return */

	return GridController;

});