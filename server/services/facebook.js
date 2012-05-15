/**
 *	FacebookService
 */

define([

	/** @require */

	// services
	'services/channel',

	//modules
	'util',
	'events',
	'request',

	// utils
	'utils/requestn',

	// config
	'config/global.config'
],


/**
*	@class FacebookService
*/

function(ChannelService, util, events, request, requestN, config) {

	/** @constructor */

	var FacebookService = function() {

		/** @borrow EventEmitter.constructor */ 
		events.EventEmitter.call(this);

		return this;

	};

	/** @inherits EventEmitter */
	util.inherits(FacebookService, events.EventEmitter);


	/** @private */
	var _channelService = new ChannelService();

	/** @public */

	/** Get Facebook open graph data for an array of urls */ 
	FacebookService.prototype.getGraphDataForUrls = function(urls) {
		'use strict';

		var self = this;
		var batchesCount, i, facebookUrls;
		var urlBatches = []; 
		var URL_BATCH_SIZE = 10;

		// Group URLs into batches of 10
		batchesCount = Math.ceil(urls.length / URL_BATCH_SIZE);
		for (i=0; i<batchesCount; i++) {
			urlBatches[i] = urls.slice( URL_BATCH_SIZE * i,  URL_BATCH_SIZE * (i+1) );
		}

		// Compose facebook open graph URLs for the URL batches
		facebookUrls = urlBatches.map(function(urlBatch){
			return 'http://graph.facebook.com/?ids=' + urlBatch.join(',');
		});

		// Make all the facebook requests, and gather the responses
		requestN(
			facebookUrls,
			function(responses){

				var aggregatedResponses = facebookUrls.reduce(function(out, facebookUrl){
					var response = responses[facebookUrl];
					if (!response.error) {
						var multiGraphData = JSON.parse(response.body);
						for(var url in multiGraphData) {
							if (multiGraphData.hasOwnProperty(url)) {
								out[url] = multiGraphData[url];
							}
						}
					}
					return out;
				}, {});

				// Emit event when the data is available
				self.emit('getGraphDataForUrls', aggregatedResponses);
			}
		);

	}

	/** Get Facebook open graph data for all channels */
	FacebookService.prototype.getGraphDataForAllChannels = function() {
		'use strict';

		var self = this;

		// Step 1: get a list of all channels (should be cached)
		// Step 2: once we have a list of channels, make a batch of Facebook open graph api calls
		//   to get the like counts for each channel, and then combine the results. 
		_channelService.once('getChannels', function(channels) {

			// Map channels to channel URLs
			var channelUrls = channels.map(function(channel){
				return config.APP_URL + 'channel/' + channel.id;
			});

			// Get Facebook open graph data for the channel URLs 
			self.once('getGraphDataForUrls', function(graphData){

				// Emit event when the data is available
				self.emit('getGraphDataForAllChannels', graphData);

			}).getGraphDataForUrls(channelUrls);

		}).getChannels();		


		return this;

	};

	/** @return */

	return FacebookService;

});