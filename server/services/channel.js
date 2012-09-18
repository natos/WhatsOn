/**
 *	ChannelService
 */

define([

	/** @require */

	//modules
	'util',
	'events',
	'request',

	// utils
	'utils/requestn',
	'utils/cache',

	// services
	'services/domain',
	'services/bookings',
	'services/tvtips',

	// config
	'config/global.config'
],


/**
*	@class ChannelService
*/

function(util, events, request, requestN, cache, DomainService, BookingsService, TVTipsService, config) {

	/** @constructor */

	var ChannelService = function() {

		/** @borrow EventEmitter.constructor */ 
		events.EventEmitter.call(this);

		return this;

	};

	/** @inherits EventEmitter */
	util.inherits(ChannelService, events.EventEmitter);


	/** @private */

	//constants
	var CHANNELS_BACH = config.API_PREFIX + '/linear/lineups/generic-upc.nl/services.json?show=name,channel,logicalPosition,logoLink&maxBatchSize=400',
		/* 
			### For the old API ####

		ALL_CHANNELS_0  = config.API_PREFIX + 'Channel.json?order=position&batch=0',
		ALL_CHANNELS_1  = config.API_PREFIX + 'Channel.json?order=position&batch=1',
		ALL_CHANNELS_2  = config.API_PREFIX + 'Channel.json?order=position&batch=2',
		CHANNEL_DETAILS	= config.API_PREFIX + 'Channel/%%id%%.json',
		CHANNEL_EVENTS	= config.API_PREFIX + 'Channel/%%id%%/events/NowAndNext.json?order=startDateTime',
		*/
		COLLECTION = [];

	
	/** @public */

	/** Get list of all channels */
	ChannelService.prototype.getChannels = function() {

		var self = this,

		// get channels from cache
		allChannels = cache.get('channels-list');

		// get Batch of channels
		function getChannelBatch(URL) {

			var partial;

			request(URL, function(error, response, body) {

				// Describe errors
				if (error) {
					console.log('<Channel Service>','ERROR:', error);
				}

				// Parse string response
				partial = JSON.parse(body);

				// save each channel object
				partial.data.forEach(function(item){
					COLLECTION.push(item);
				})

				// check if there more batches to request
				if (partial.nextBatchLink && partial.nextBatchLink.href) {
					console.log('<Channel Service>','Getting new Batch.','Total channels: ', COLLECTION.length);
					// more batches? Recursivly get more 
					getChannelBatch(partial.nextBatchLink.href);
				} else {
					console.log('<Channel Service>','FINISH.','Total channels: ', COLLECTION.length);
					cache.set('channels-list', COLLECTION, 3600); // 1 hour
					self.emit('getChannels', COLLECTION);
				}

			});
		}

		// respond from cache
		if (allChannels) {
			// from cache
			self.emit('getChannels', allChannels);

			return this;
		}

		// start getting batches
		getChannelBatch(CHANNELS_BACH);

		return this;

/* 
	### For the old API ####

		// Return channels from cache, if available
		var allChannels = cache.get('channels-list');
		if (allChannels) {
			// from cache
			self.emit('getChannels', allChannels);
		} else {

			var requestUrls = [ALL_CHANNELS_0, ALL_CHANNELS_1, ALL_CHANNELS_2];

			requestN(
				requestUrls,
				function(responses) {
					var errorsCount = 0;
					var channelsBatch;
					var i;

					for (i=0; i<requestUrls.length; i++) {
						if (!responses[requestUrls[i]] || responses[requestUrls[i]].error) {
							// TODO: Review this, because it crash when responses[thingy] is empty
							console.log("Error requesting " + requestUrls[i] + ": " + responses[requestUrls[i]].error);
							errorsCount++;
						}
					}

					if (errorsCount===0) {
						allChannels = []; // Reset the allChannels array; don't add to the existing list.
						for (i=0; i<requestUrls.length; i++) {
							if (!responses[requestUrls[i]].error && responses[requestUrls[i]].response.statusCode == 200) {
								channelsBatch = JSON.parse(responses[requestUrls[i]].body);
								allChannels = allChannels.concat(channelsBatch);
							}
						}
					}

					// Attach domain information to each channel
					(new DomainService()).once('getDomains', function(domains){

						var channelFilterIds = [];
						var channelThemeIds = [];
						var channelDomains;
						allChannels.forEach(function(channel){
							var channelDomains = domains.map(function(domain){
								var channelDomainGroups = [];
								domain.groups.forEach(function(group){
									if (group.channelIds.indexOf(channel.id) >= 0) {
										channelDomainGroups.push(group.id);
									}
								});

								return ({
									id: domain.id,
									groups: channelDomainGroups
								});
							});
							channel.domains = channelDomains;

						});

						// Cache the channels
						cache.set('channels-list', allChannels, 3600); // 1 hour
						self.emit('getChannels', allChannels);

					}).getDomains();

				}

			);

		}

		return this;
*/
	};

	/** Get data from a channel */
	ChannelService.prototype.getDetails = function(id) {

		var self = this;

		request(CHANNEL_DETAILS.replace(/%%id%%/, id), function(error, response, body) {

			self.emit('getDetails', error, response, body);

		});

		return this;

	};

	/** Get list of events from a channel */
	ChannelService.prototype.getEvents = function(id) {

		var self = this;

		request(CHANNEL_EVENTS.replace(/%%id%%/, id), function(error, response, body) {

			self.emit('getEvents', error, response, body);

		});

		return this;
	};

	/**
	 * Return a list of the IDs of "popular" channels.
	 * This list is generated from the TV Tips and Top Bookings.
	 */
	ChannelService.prototype.getPopularChannelIds = function(marketId) {

		var self = this;

		(new ChannelService()).once('getChannels', function(allChannels) {
			(new BookingsService()).once('getTopBookings', function(topBookings) {
				(new TVTipsService()).once('getTVTips', function(tvTips){

					var popularChannelIds = [];

					// Find the SD equivalent for an HD channel,
					// based on the (naive) assumption that the HD version
					// will have the same name as the SD version, but with
					// the string " HD" at the end.
					function findSdEquivalentChannel(hdChannelName) {
						var sdChannelName = channel.name.slice(0,-3);
						var foundChannels = allChannels.filter(function(el, ix, arr){
							return el.name === sdChannelName;
						});
						if (foundChannels.length > 0) {
							return foundChannels[0];
						} else {
							return null;
						}
					}

					// Iterate over an array of events, and check the channel
					// for each event. Add the channel ID to popularChannelIds
					// if it is not there yet.
					function extractChannelIdsFromEventsArray (eventsArray) {
						eventsArray.forEach(function(el, ix, arr){
							channel = el.channel;

							if (channel.name.slice(-3) === ' HD') {
								channel = findSdEquivalentChannel(channel.name) || channel;
							}

							if (popularChannelIds.indexOf(channel.id) < 0) {
								popularChannelIds.push(channel.id);
							}
						});
					}

					extractChannelIdsFromEventsArray(topBookings);
					extractChannelIdsFromEventsArray(tvTips);

					self.emit('getPopularChannelIds', popularChannelIds);

				}).getTVTips();
			}).getTopBookings();
		}).getChannels();

		return this;

	}

	/** @return */

	return ChannelService;

});