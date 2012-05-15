/**
 *	FacebookController
 */

define([

	/** @require */

	// services
	'services/facebook'

],


/**
 *	@class FacebookController
 */

function(FacebookService) {

	/** @constructor */

	var FacebookController = function(app) {

		_app = app;

		// Routing

		app.server.get('/channel_likes.json', this.renderChannelLikes);

		app.server.get('/og_test.json', this.ogTest);

	};


	/** @private */

	var _app,

		_facebookService = new FacebookService();


	/** @public */

	FacebookController.prototype.renderChannelLikes = function(req, res) {

		// Get facebook open graph data for all channels
		_facebookService.once('getGraphDataForAllChannels', function(graphData) {

			// Render json data
			res.send(graphData);

		}).getGraphDataForAllChannels();

	};

	FacebookController.prototype.ogTest = function(req, res) {

		// Get facebook open graph data for a couple of arbitrary urls
		urls = [
			'http://pandodaily.com/2012/05/14/whats-with-all-the-hyper-growth-startups/',
			'http://edition.cnn.com/',
			'https://www.facebook.com/'
		];
		_facebookService.once('getGraphDataForUrls', function(graphData) {

			// Render json data
			res.send(graphData);

		}).getGraphDataForUrls(urls);

	};


	/** @return */

	return FacebookController;

});