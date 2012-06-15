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

	// services
	'services/domain',

	// config
	'config/global.config'
],


/**
*	@class ChannelService
*/

function(util, events, request, requestN, DomainService, config) {

	/** @constructor */

	var ChannelService = function() {

		/** @borrow EventEmitter.constructor */ 
		events.EventEmitter.call(this);

		return this;

	};

	/** @inherits EventEmitter */
	util.inherits(ChannelService, events.EventEmitter);


	/** @private */

	var ALL_CHANNELS_0  = config.API_PREFIX + 'Channel.json?order=position&batch=0',
		ALL_CHANNELS_1  = config.API_PREFIX + 'Channel.json?order=position&batch=1',
		ALL_CHANNELS_2  = config.API_PREFIX + 'Channel.json?order=position&batch=2',
		CHANNEL_DETAILS	= config.API_PREFIX + 'Channel/%%id%%.json',
		CHANNEL_EVENTS	= config.API_PREFIX + 'Channel/%%id%%/events/NowAndNext.json?order=startDateTime';

	var CHANNELS_CACHE = {
		list		: [],
		timestamp	: null,
		duration	: 60 * 60 * 1000 // cache for 1 hour
	};

	/** @public */

	/** Get list of all channels */
	ChannelService.prototype.getChannels = function() {

		var self = this,
			allChannels = CHANNELS_CACHE.list,
			allChannels_timestamp = CHANNELS_CACHE.timestamp,
			now = new Date(),
			cacheDurationMilliseconds = CHANNELS_CACHE.duration;

		// Return channels from cache, if available
		if (allChannels && allChannels.length > 0 && allChannels_timestamp && typeof(allChannels_timestamp.valueOf)==='function' && (now.valueOf() - allChannels_timestamp.valueOf() < cacheDurationMilliseconds)) {
			// from cache
			self.emit('getChannels', allChannels);
		} else {

			var requestUrls = [ALL_CHANNELS_0, ALL_CHANNELS_1, ALL_CHANNELS_2];

			requestN(
				requestUrls,
				function(responses) {
					var errorsCount = 0;
					var channelsBatch;

					try {
						for (var i=0; i<requestUrls.length; i++) {
							if (!responses[requestUrls[i]] || responses[requestUrls[i]].error) {
								// TODO: Review this, because it crash when responses[thingy] is empty
								console.log("Error requesting " + requestUrls[i] + ": " + responses[requestUrls[i]].error);
								errorsCount++;
							}
						}

						if (errorsCount===0) {
							for (var i=0; i<requestUrls.length; i++) {
								if (!responses[requestUrls[i]].error && responses[requestUrls[i]].response.statusCode == 200) {
									channelsBatch = JSON.parse(responses[requestUrls[i]].body);
									allChannels = allChannels.concat(channelsBatch);
								}
							}
						}

						// Remove the "links" property for channels. This property is not used, and only takes up space.
						allChannels.forEach(function(channel){
							delete channel.links;
						});

						// Attach domain information to each channel
						(new DomainService()).once('getDomains', function(domains){

							var channelFilterIds = [];
							var channelThemeIds = [];
							var channelDomains
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
							CHANNELS_CACHE.list = allChannels;
							CHANNELS_CACHE.timestamp = now;
							self.emit('getChannels', allChannels);

						}).getDomains();

					} catch (e) {
						console.log('Failed to retrieve channels');
						console.log(e);
					}
				}

			);

		}

		return this;

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

	/** @return */

	return ChannelService;

});