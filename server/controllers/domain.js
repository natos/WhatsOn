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

		app.server.get('/domain/:id/details.json', this.renderDomainDetails);

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

	/** Render a JSON of domain details */
	DomainController.prototype.renderDomainDetails = function(req, res) {

		var id = req.params.id;

		new DomainService().once('getDomainDetails', function(domainDetails) {

			res.send(domainDetails); // JSON output

		}).getDomainDetails(id);

	};


	/** @return */

	return DomainController;

});