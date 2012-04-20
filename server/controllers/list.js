/**
 *	ListController
 */

define([

	/** @require */

	// services
	'services/channel',

	// utils
	'utils/metadata'

],


/**
 *	@class ListController
 */

function(Channel, Metadata) {

	/** @constructor */

	var ListController = function(app) {

		_app = app;

		// Routing

		app.server.get('/list.html', this.render);

	};


	/** @private */

	var _app,

		metadata = new Metadata(),

		ChannelService = new Channel();


	/** @public */

	ListController.prototype.render = function(req, res) {

		ChannelService.once('getChannels', function(error, response, body) {

			var channels = JSON.parse(body);

			res.render('list.jade', {
				metadata	: metadata.get(),
				config		: _app.config,
				channels	: channels,
				supports	: req.supports
			});

		}).getChannels();

	};

	/** @return */

	return ListController;

});