/**
 *	EventController
 */

define([

	/** @require */

	// services
	'services/tvevent',

	// utils
	'utils/metadata',
	'utils/requestn'

],


/**
 *	@class EventController
 */

function(TVEventService, Metadata, Requestn) {

	/** @constructor */

	var EventController = function(app) {

		_app = app;

		// Routing

		app.server.get('/event/:id', this.render);

	};


	/** @private */

	var _app,

		metadata = new Metadata()

	/** @public */

	/**
	 * At the moment, we don't show an event page.
	 * Instead, redirect to the programme page for the event.
	 */
	EventController.prototype.render = function(req, res) {

		var id = req.params.id;

		new TVEventService().once('getDetails', function(error, response, body) {

			if ( !response || /500|404/.test(response.statusCode) ) {
				res.statusCode = 404;
			} else {
				eventDetails = JSON.parse(body);
				res.redirect('/programme/' + eventDetails.programme.id);
			}

			res.end();

		}).getDetails(id);

	};

	/** @return */

	return EventController;

});