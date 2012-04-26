/**
 *	ListController
 */

define([

	/** @require */

	// services
	'services/nowandnext',

	// utils
	'utils/metadata',

	'querystring',
	'config/global.config'

],


/**
 *	@class ListController
 */

function(NowAndNextService, Metadata, QS, config) {

	/** @constructor */

	var ListController = function(app) {

		_app = app;

		// Routing

		app.server.get('/list', this.render);

	};


	/** @private */

	var _app,

		metadata = new Metadata(),

		nowAndNextService = new NowAndNextService();


	/** @public */

	ListController.prototype.render = function(req, res) {

		var dt = new Date(); // TODO: get the date from the querystring
		nowAndNextService.once('getNowAndNext', function(channels, channelEventsCollections){

			res.render('list.jade', {
				metadata	: metadata.get(),
				config		: _app.config,
				channels	: channels,
				channelEventsCollections: channelEventsCollections,
				supports	: req.supports
			});

		}).getNowAndNext(dt);

	};

	/** @return */

	return ListController;

});