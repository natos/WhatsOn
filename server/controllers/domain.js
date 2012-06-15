/**
 *	DomainController
 */

define([

	/** @require */

	// services
	'services/domain'

],


/**
 *	@class DomainController
 */

function(DomainService) {

	/** @constructor */

	var DomainController = function(app) {

		_app = app;

		// Routing

		app.server.get('/domains.json', this.renderDomains);

	};


	/** @private */

	var _app;


	/** @public */


	/** Render a JSON list of all domains */
	DomainController.prototype.renderDomains = function(req, res) {

		new DomainService().once('getDomains', function(domains) {

			res.send(domains); // JSON output

		}).getDomains();

	};


	/** @return */

	return DomainController;

});