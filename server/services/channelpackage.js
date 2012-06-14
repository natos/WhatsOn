/**
 *	ChannelPackageService
 */

define([

	/** @require */

	//modules
	'util',
	'events',
	'request',

	// config
	'config/channel_packages.config'
],


/**
*	@class ChannelPackageService
*/

function(util, events, request, channelPackagesConfig) {

	/** @constructor */

	var ChannelPackageService = function() {

		/** @borrow EventEmitter.constructor */ 
		events.EventEmitter.call(this);

		return this;

	};

	/** @inherits EventEmitter */
	util.inherits(ChannelPackageService, events.EventEmitter);


	/** @private */


	/** @public */

	/** Get list of all channel packages */
	ChannelPackageService.prototype.getChannelPackages = function() {

		this.emit('getChannelPackages', channelPackagesConfig);
		return this;

	};

	/** Get details for a single channel package */
	ChannelPackageService.prototype.getChannelPackageDetails = function(channelPackageId) {

		var foundChannelPackage = {};

		var matchingPackages = channelPackagesConfig.filter(function(el, ix, arr){
			return (el.id && el.id===channelPackageId);
		});

		if (matchingPackages.length > 0) {
			foundChannelPackage = matchingPackages[0];
		}

		this.emit('getChannelPackageDetails', foundChannelPackage);
		return this;

	};

	/** Get list of channels for a single package */
	ChannelPackageService.prototype.getChannelPackageChannels = function(channelPackageId) {

		this.emit('getChannelPackageChannels', {});
		return this;

	};

	/** @return */

	return ChannelPackageService;

});