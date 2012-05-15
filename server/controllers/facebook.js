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

		// Get a list of all channels, sorted by like counts (descending)
		app.server.get('/most_liked_channels.json', this.renderChannelLikes);

		// Sample URL for testing purposes only
		app.server.get('/og_test.json', this.ogTest);

	};


	/** @private */

	var _app,

		_facebookService = new FacebookService();


	/** @public */

	FacebookController.prototype.renderChannelLikes = function(req, res) {

		// Get facebook open graph data for all channels
		_facebookService.once('getGraphDataForAllChannels', function(graphData) {

			// Turn the object hash into an array
			var channels = [];
			for (var channelUrl in graphData) {
				if (graphData.hasOwnProperty(channelUrl)) {
					channels.push(graphData[channelUrl])
				}
			}

			// Sort the array by likes
			var compareOpenGraphObjectsByLikeCountDesc = function(b,a){
				if (!a.likes) {a.likes = 0};
				if (!b.likes) {b.likes = 0};
				if (a.likes < b.likes) {return -1};
				if (a.likes > b.likes) {return 1};
				return 0;
			}
			channels.sort(compareOpenGraphObjectsByLikeCountDesc);

			// Render json data
			res.send(channels);

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