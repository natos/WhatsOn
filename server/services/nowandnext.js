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

	var PROGRAMME_EVENTS = config.API_PREFIX + 'Programme/%%id%%/events.json?order=startDateTime';
		API_CHANNEL_BATCH_SIZE = 5,
		API_EVENTS_BATCH_SIZE = 4;

	// TODO: build a mechanism to flush the cache. At the moment, it is write-only.
	var _cache = {};

	var _channelService = new ChannelService();

	// Given a date, return a string in the format 'YYYY-MM-DDTHH:00Z',
	// which is the format the EPG api accepts for marking the start time.
	var getExactFormattedSliceStartTime = function(dt) {
		return dt.getUTCFullYear().toString() + '-' + ('00' + (dt.getUTCMonth() + 1).toString()).slice(-2) + '-' + ('00' + dt.getUTCDate().toString()).slice(-2) + 'T' + ('00' + dt.getUTCHours().toString()).slice(-2) + ':' + ('00' + dt.getUTCMinutes().toString()).slice(-2) + 'Z';
	};

	// Given a date, return a string in the format 'YYYY-MM-DDTHH:00Z',
	// which is the format the EPG api accepts for marking the start time.
	// This function IGNORES the MINUTES of the specified time.
	var getRoundedFormattedSliceStartTime = function(dt) {
		return dt.getUTCFullYear().toString() + '-' + ('00' + (dt.getUTCMonth() + 1).toString()).slice(-2) + '-' + ('00' + dt.getUTCDate().toString()).slice(-2) + 'T' + ('00' + dt.getUTCHours().toString()).slice(-2) + ':00Z';
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

	var cacheEventsForChannel = function(eventsForChannel, formattedSliceStartTime) {
		if (eventsForChannel.length > 0) {
			cacheKey = eventsForChannel[0].channel.id + "__" + formattedSliceStartTime;
			_cache[cacheKey] = eventsForChannel;
		}
	}

	var cacheNowAndNextApiResponses = function(nowAndNextRequests, responses, formattedSliceStartTime) {
		var i, j,
			response,
			eventsForChannel, 
			cacheKey;

		// Take the responses, extract the channelEvents, and put them in cache
		for (i=0; i< nowAndNextRequests.length; i++) {
			// The now&next response sometimes goes wacky, and parsing can fail.
			if (responses[nowAndNextRequests[i]] && responses[nowAndNextRequests[i]].body) {
				try {
					response = JSON.parse(responses[nowAndNextRequests[i]].body);
				}
				catch(e) {
					// TODO: proper logging
					console.log('Failed to parse response from ' + nowAndNextRequests[i]);
					console.log(responses[nowAndNextRequests[i]])
				}

				if (response && response.length > 0) {
					// If only one channel was requested, the response is an array of events.
					// If multiple channels were requested, the response in an array of channels, and each channel holds an array of events
					// See also: http://christianheilmann.com/2010/09/22/the-annoying-thing-about-yqls-json-output-and-the-reason-for-it/
					if (response[0]._type === 'Event') {
						cacheEventsForChannel(response, formattedSliceStartTime);
					} else {
						for (j=0; j<response.length; j++) {
							cacheEventsForChannel(response[j], formattedSliceStartTime)
						}
					}
				}

			}
		}
	};


	/** @public */

	/** Get list of now-and-next events */
	NowAndNextService.prototype.getNowAndNext = function(dt, requestedChannelIds, exact) {

		var self = this;

		// Step 1: get a list of all channels (should be cached)
			// >>> NS: 25/06/2012: The channel list is available on App module as a constant
		// Step 2: once we have a list of channels, make a batch of now+next api calls, and combine their results 
		_channelService.once('getChannels', function(channels) {
			var i, j,
				requestedChannels = [],
				formattedSliceStartTime = exact ? getExactFormattedSliceStartTime(dt) : getRoundedFormattedSliceStartTime(dt),
				channelIdsToFetch = [], // Compose an array of the channel Ids whose events for this slice are not in cache yet
				cacheKey,
				channelIdBatches = [],
				batchesCount,
				nowAndNextRequests = [],
				request,
				channelEventsCollection;

			// If we have been passed an array of channels, limit the lookup to just these channels
			if (requestedChannelIds) {
				requestedChannels = channels.filter(function(channel, index, arr){
					return (requestedChannelIds.indexOf(channel.id) >= 0);
				});
			} else {
				// No array of channels: return ALL channels
				requestedChannels = channels;
			}

			// First, check the cache for this time slice. 
			// If we do not have events for a [channel + timeslice],
			// then add the channel to a list of channels to fetch from the API. 
			for (i=0; i<requestedChannels.length; i++) {
				cacheKey = requestedChannels[i].id + "__" + formattedSliceStartTime;
				if (!_cache[cacheKey]) {
					channelIdsToFetch.push(requestedChannels[i].id);
				}
			}

			// The API accepts requests for batches of channels.
			batchesCount = Math.ceil(channelIdsToFetch.length / API_CHANNEL_BATCH_SIZE);
			for (i=0; i<batchesCount; i++) {
				channelIdBatches[i] = channelIdsToFetch.slice( API_CHANNEL_BATCH_SIZE * i, API_CHANNEL_BATCH_SIZE * (i+1) );
			}

			// For each channel batch, create an API request URL
			for (i=0; i<channelIdBatches.length; i++) {
				request = config.API_PREFIX + 'Channel/' + channelIdBatches[i].join('|') + '/events/NowAndNext_' + formattedSliceStartTime + '.json?batchSize=' + API_EVENTS_BATCH_SIZE + '&order=startDateTime&optionalProperties=Programme.subcategory';
				nowAndNextRequests.push(request);
			}

			if (nowAndNextRequests.length > 0) {
				// Make multiple API requests, and put the results in cache.
				RequestN(
					nowAndNextRequests,
					function(responses) {
						cacheNowAndNextApiResponses(nowAndNextRequests, responses, formattedSliceStartTime);
						self.emit('getNowAndNext', requestedChannels, getChannelEventsCollections(requestedChannels, formattedSliceStartTime));
					}
				);
			} else {
				// Retrieve results directly from cache
				self.emit('getNowAndNext', requestedChannels, getChannelEventsCollections(requestedChannels, formattedSliceStartTime));
			}

		}).getChannels();

		return this;
	};

	/** @return */

	return NowAndNextService;

});