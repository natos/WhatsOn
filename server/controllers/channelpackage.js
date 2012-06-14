/**
 *	ChannelPackageController
 */

define([

	/** @require */

	// services
	'services/channelpackage'

],


/**
 *	@class ChannelPackageController
 */

function(ChannelPackageService) {

	/** @constructor */

	var ChannelPackageController = function(app) {

		_app = app;

		// Routing

		app.server.get('/channelpackages.json', this.renderChannelPackages);

		app.server.get('/channelpackage/:id/details.json', this.renderChannelPackageDetails);

		app.server.get('/channelpackage/:id/channels.json', this.renderChannelPackageChannels);

	};


	/** @private */

	var _app;


	/** @public */


	/** Render a JSON list of all channel packages */
	ChannelPackageController.prototype.renderChannelPackages = function(req, res) {

		new ChannelPackageService().once('getChannelPackages', function(channelPackages) {

			res.send(channelPackages); // JSON output

		}).getChannelPackages();

	};

	/** Render a JSON response of the details for a single channel package */
	ChannelPackageController.prototype.renderChannelPackageDetails = function(req, res) {

		var id = req.params.id;

		new ChannelPackageService().once('getChannelPackageDetails', function(details) {

			res.send(details); // JSON output

		}).getChannelPackageDetails(id);

	};

	/** Render a JSON response of the channels in a single channel package */
	ChannelPackageController.prototype.renderChannelPackageChannels = function(req, res) {

		var id = req.params.id;

		new ChannelPackageService().once('getChannelPackageChannels', function(channels) {

			res.send(channels); // JSON output

		}).getChannelPackageChannels(id);

	};


	/** @return */

	return ChannelPackageController;

});