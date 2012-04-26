/**
 *	ListController
 */

define([

	/** @require */

	// services
	'services/channel',

	// utils
	'utils/metadata',
	'utils/requestn',

	'querystring',
	'config/global.config'

],


/**
 *	@class ListController
 */

function(Channel, Metadata, RequestN, QS, config) {

	/** @constructor */

	var ListController = function(app) {

		_app = app;

		// Routing

		app.server.get('/list', this.render);

	};


	/** @private */

	var _app,

		metadata = new Metadata(),

		ChannelService = new Channel(),

		cache = {};


	var renderChannelsAndEvents = function(req, res, channels, formattedSliceStartTime) {

		// Compose a list of channelEventsCollections, ordered according to the original channel list
		var channelEventsCollections = [],
			cacheKey,
			i;

		for (i=0; i<channels.length; i++) {
			cacheKey = channels[i].id + "__" + formattedSliceStartTime;
			if (cache[cacheKey]) {
				channelEventsCollections.push({
					'channel' : channels[i],
					'channelEvents' : cache[cacheKey]
				});
			}
		}

		// Render
		res.render('list.jade', {
			metadata	: metadata.get(),
			config		: _app.config,
			channels	: channels,
			channelEventsCollections: channelEventsCollections,
			supports	: req.supports
		});

	}

	/** @public */

	ListController.prototype.render = function(req, res) {

		// Step 1: get a list of all channels (should be cached)
		// Step 2: once we have a list of channels, make a batch of now+next api calls, and combine their results 
		// TODO: refactor this use the same style as the other controllers: move most of the code into a service.
		ChannelService.once('getChannels', function(error, response, body) {
			var i, j,
				channels = JSON.parse(body),
				dt = new Date(),
				formattedSliceStartTime = dt.getFullYear().toString() + '-' + ('00' + (dt.getMonth() + 1).toString()).slice(-2) + '-' + ('00' + dt.getDate().toString()).slice(-2) + 'T' + ('00' + dt.getHours().toString()).slice(-2) + ':00' + 'Z',
				channelIdsToFetch = [], // Compose an array of the channel Ids whose events for this slice are not in cache yet
				cacheKey;

			for (i=0; i<channels.length; i++) {
				cacheKey = channels[i].id + "__" + formattedSliceStartTime;
				if (!cache[cacheKey]) {
					channelIdsToFetch.push(channels[i].id);
				}
			}

			// Build an array of channel batches
			var channelIdBatches = [];
			var batchSize = 5;
			var batchesCount = Math.ceil(channelIdsToFetch.length / batchSize);
			for (i=0; i<batchesCount; i++) {
				channelIdBatches[i] = channelIdsToFetch.slice( batchSize * i, batchSize * (i+1) );
			}

			// For each channel batch, create an API request URL
			var nowAndNextRequests = [];
			var EVENTS_PER_SLICE = 4;
			for (i=0; i<channelIdBatches.length; i++) {
				var request = config.API_PREFIX + 'Channel/' + channelIdBatches[i].join('|') + '/events/NowAndNext_' + formattedSliceStartTime + '.json?batchSize=' + EVENTS_PER_SLICE + '&order=startDateTime';
				nowAndNextRequests.push(request);
			}

			if (nowAndNextRequests.length > 0) {
				RequestN(
					nowAndNextRequests,

					function(responses) {
						var i, j,
							response,
							eventsForChannel, 
							cacheKey;

						// Take the responses, extract the channelEvents, and put them in cache
						for (i=0; i< nowAndNextRequests.length; i++) {
							response = JSON.parse(responses[nowAndNextRequests[i]].body);
							for (j=0; j<response.length; j++) {
								eventsForChannel = response[j];
								if (eventsForChannel.length > 0) {
									cacheKey = eventsForChannel[0].channel.id + "__" + formattedSliceStartTime;
									cache[cacheKey] = eventsForChannel;
								}
							}
						}

						renderChannelsAndEvents(req, res, channels, formattedSliceStartTime);
					}

				);
			} else {
				renderChannelsAndEvents(req, res, channels, formattedSliceStartTime);
			}

		}).getChannels();

	};

	/** @return */

	return ListController;

});