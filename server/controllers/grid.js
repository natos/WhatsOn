/**
 *	GridController
 */

define([

	/** @require */

	// services
	'services/grid',

	// utils
	'utils/metadata'

],


/**
 *	@class GridController
 */

function(GridService, Metadata) {

	/** @constructor */

	var GridController = function(app) {

		_app = app;

		// Routing

		app.server.get('/grid', this.render);

		app.server.get('/grid/events/:channels/:start/:end', this.events);

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
			supports	: req.supports,
			xhr			: req.xhr
		});

	};

	GridController.prototype.events = function(req, res) {

		console.log(req.params);

		new GridService().once('getEvents', function(error, response, body) {

			if ( !response || /500|404/.test(response.statusCode) ) {
				res.statusCode = 404;
			} else {
				events = JSON.parse(body);
				res.send(events);
			}

			res.end();

		}).getEvents(req.params.channels, req.params.start, req.params.end);

	};

	/** @return */

	return GridController;

});