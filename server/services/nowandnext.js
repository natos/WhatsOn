/**
 *	NowAndNextService
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
 *	@class NowAndNextService
 */

function(ChannelService, util, events, request, RequestN, config) {

	/** @constructor */

	var NowAndNextService = function() {

		/** @borrow EventEmitter.constructor */ 
		events.EventEmitter.call(this);

		return this;

	};

	/** @inherits EventEmitter */
	util.inherits(NowAndNextService, events.EventEmitter);


	/** @private */

	var API_CHANNEL_BATCH_SIZE = 5,
		API_EVENTS_BATCH_SIZE = 4;

	// TODO: build a mechanism to flush the cache. At the moment, it is write-only.
	var _cache = {};

	var _channelService = new ChannelService();

	// Given a date, return a string in the format 'YYYY-MM-DDTHH:00Z',
	// which is the format the EPG api accepts for marking the start time.
	// Note that we ignore that MINUTES of the specified time, so that we
	// always ask the EPG api for data starting at the top of each hour.
	var getFormattedSliceStartTime = function(dt) {
		return dt.getFullYear().toString() + '-' + ('00' + (dt.getMonth() + 1).toString()).slice(-2) + '-' + ('00' + dt.getDate().toString()).slice(-2) + 'T' + ('00' + dt.getHours().toString()).slice(-2) + ':00Z';
	};


	var getChannelEventsCollections = function(channels, formattedSliceStartTime) {
		// Compose a list of channelEventsCollections, ordered according to the original channel list
		var channelEventsCollections = [],
			cacheKey,
			i;

		for (i=0; i<channels.length; i++) {
			cacheKey = channels[i].id + "__" + formattedSliceStartTime;
			if (_cache[cacheKey]) {
				channelEventsCollections.push({
					'channel' : channels[i],
					'channelEvents' : _cache[cacheKey]
				});
			}
		}

		return channelEventsCollections;
	};


	var cacheNowAndNextApiResponses = function(nowAndNextRequests, responses, formattedSliceStartTime) {
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
					_cache[cacheKey] = eventsForChannel;
				}
			}
		}
	};


	/** @public */

	/** Get list of top movies */
	NowAndNextService.prototype.getNowAndNext = function(dt) {

		var self = this;

		// Step 1: get a list of all channels (should be cached)
		// Step 2: once we have a list of channels, make a batch of now+next api calls, and combine their results 
		_channelService.once('getChannels', function(error, response, body) {
			var i, j,
				channels = JSON.parse(body),
				formattedSliceStartTime = getFormattedSliceStartTime(dt),
				channelIdsToFetch = [], // Compose an array of the channel Ids whose events for this slice are not in cache yet
				cacheKey,
				channelIdBatches = [],
				batchesCount,
				nowAndNextRequests = [],
				request,
				channelEventsCollection;

			// First, check the cache for this time slice. 
			// If we do not have events for a [channel + timeslice],
			// then add the channel to a list of channels to fetch from the API. 
			for (i=0; i<channels.length; i++) {
				cacheKey = channels[i].id + "__" + formattedSliceStartTime;
				if (!_cache[cacheKey]) {
					channelIdsToFetch.push(channels[i].id);
				}
			}

			// The API accepts requests for batches of channels.
			batchesCount = Math.ceil(channelIdsToFetch.length / API_CHANNEL_BATCH_SIZE);
			for (i=0; i<batchesCount; i++) {
				channelIdBatches[i] = channelIdsToFetch.slice( API_CHANNEL_BATCH_SIZE * i, API_CHANNEL_BATCH_SIZE * (i+1) );
			}

			// For each channel batch, create an API request URL
			for (i=0; i<channelIdBatches.length; i++) {
				request = config.API_PREFIX + 'Channel/' + channelIdBatches[i].join('|') + '/events/NowAndNext_' + formattedSliceStartTime + '.json?batchSize=' + API_EVENTS_BATCH_SIZE + '&order=startDateTime';
				nowAndNextRequests.push(request);
			}

			if (nowAndNextRequests.length > 0) {
				// Make multiple API requests, and put the results in cache.
				RequestN(
					nowAndNextRequests,
					function(responses) {
						cacheNowAndNextApiResponses(nowAndNextRequests, responses, formattedSliceStartTime);
						self.emit('getNowAndNext', channels, getChannelEventsCollections(channels, formattedSliceStartTime));
					}
				);
			} else {
				// Retrieve results directly from cache
				self.emit('getNowAndNext', channels, getChannelEventsCollections(channels, formattedSliceStartTime));
			}

		}).getChannels();

		return this;
	};

	/** @return */

	return NowAndNextService;

});