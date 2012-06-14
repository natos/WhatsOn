/**
 *	ChannelPackageService
 */

define([

	/** @require */

	// modules
	'util',
	'events',
	'request',

	// services
	'services/channel',

	// config
	'config/channel_packages.config'
],


/**
*	@class ChannelPackageService
*/

function(util, events, request, _channelService, channelPackagesConfig) {

	/** @constructor */

	var ChannelPackageService = function() {

		/** @borrow EventEmitter.constructor */ 
		events.EventEmitter.call(this);

		return this;

	};

	/** @inherits EventEmitter */
	util.inherits(ChannelPackageService, events.EventEmitter);


	/** @private */
	var getChannelPackageById = function(channelPackageId) {

		var channelPackage = null;

		var matchingPackages = channelPackagesConfig.filter(function(el, ix, arr){
			return (el.id && el.id===channelPackageId);
		});

		if (matchingPackages.length > 0) {
			channelPackage = matchingPackages[0];
		}

		return channelPackage;

	}


	/** @public */

	/** Get list of all channel packages */
	ChannelPackageService.prototype.getChannelPackages = function() {

		this.emit('getChannelPackages', channelPackagesConfig);
		return this;

	};

	/** Get details for a single channel package */
	ChannelPackageService.prototype.getChannelPackageDetails = function(channelPackageId) {

		var channelPackage = getChannelPackageById(channelPackageId) || {};

		this.emit('getChannelPackageDetails', channelPackage);

		return this;

	};

	/** Get list of channels for a single package */
	ChannelPackageService.prototype.getChannelPackageChannels = function(channelPackageId) {

		var self = this;

		var channelPackage = getChannelPackageById(channelPackageId);

		if (channelPackage) {

			// Get a list of all channels (should be cached), and extract the channels for this channel package
			(new _channelService()).once('getChannels', function(channels) {
				var foundChannelPackageChannelIds = channelPackage.channelIds;
				var foundChannelPackageChannels = channels.filter(function(el, ix, arr){
					return (foundChannelPackageChannelIds.indexOf(el.id) >= 0);
				});

				self.emit('getChannelPackageChannels', foundChannelPackageChannels);
			}).getChannels();

		} else {
			this.emit('getChannelPackageChannels', []);
		}

		return this;

	};

	/** @return */

	return ChannelPackageService;

});