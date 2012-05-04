/**
 *	ChannelService
 */

define([

	/** @require */

	//modules
	'util',
	'events',
	'request',

	// config
	'config/global.config'

],


/**
*	@class ChannelService
*/

function(util, events, request, config) {

	/** @constructor */

	var ChannelService = function() {

		/** @borrow EventEmitter.constructor */ 
		events.EventEmitter.call(this);

		return this;

	};

	/** @inherits EventEmitter */
	util.inherits(ChannelService, events.EventEmitter);


	/** @private */

	var ALL_CHANNELS	= config.API_PREFIX + 'Channel.json?order=position',
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
			request(ALL_CHANNELS, function(error, response, body) {
				try {
					channels = JSON.parse(body);
					if (channels.length > 0) {
						// Cache the channels
						CHANNELS_CACHE.list = channels;
						CHANNELS_CACHE.timestamp = now;
						self.emit('getChannels', channels);
					}
				} catch(e) {
					console.log('Failed to retrieve channels');
					console.log(e);
				}
			});
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