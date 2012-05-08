/**
 *	GridController
 */

define([

	/** @require */

	// services
	'services/channel',

	// utils
	'utils/metadata'

],


/**
 *	@class GridController
 */

function(Channel, Metadata) {

	/** @constructor */

	var GridController = function(app) {

		_app = app;

		// Routing

		app.server.get('/grid', this.render);

	};


	/** @private */

	var _app,

		metadata = new Metadata(),

		ChannelService = new Channel();


	/** @public */

	GridController.prototype.render = function(req, res) {

		ChannelService.once('getChannels', function(channels) {

			res.render('grid.jade', {
				metadata	: metadata.get(),
				config		: _app.config,
				channels	: channels,
				timebar		: new Array(24),
				supports	: req.supports
			});

		}).getChannels();

	};

	/** @return */

	return GridController;

});