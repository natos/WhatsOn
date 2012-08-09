/**
 *	DomainService
 */

define([

	/** @require */

	// modules
	'util',
	'events',
	'request',

	// utils
	'utils/requestn',
	'utils/cache',

	// config
	'config/global.config'
],


/**
*	@class DomainService
*/

function(util, events, request, requestN, cache, config) {

	/** @constructor */

	var DomainService = function() {

		/** @borrow EventEmitter.constructor */
		events.EventEmitter.call(this);

		return this;

	};

	/** @inherits EventEmitter */
	util.inherits(DomainService, events.EventEmitter);


	/** @private */
	var ALL_DOMAINS_URL  = config.API_PREFIX + 'Domain.json',
		DOMAIN_URL = config.API_PREFIX + 'Domain/%%domainid%%.json',
		DOMAIN_GROUPS_URL = config.API_PREFIX + 'Domain/%%domainid%%/groups.json',
		DOMAIN_GROUP_CHANNELS_URL = config.API_PREFIX + 'Domain/%%domainid%%/groups/%%groupid%%/channels.json';


	/** @public */

	/** Get list of all domains, with associated channels */
	DomainService.prototype.getDomains = function() {

		var self = this;

		// Return domains from cache, if available
		var allDomains = cache.get('domains-list');
		if (allDomains) {
			// from cache
			self.emit('getDomains', allDomains);
		} else {
			// Reset domains
			allDomains = [];

			request(ALL_DOMAINS_URL, function(err, response, body){
				try {
					if (!err) {
						allDomains = JSON.parse(body);

						// Generate arrays of URLs for retrieving domain groups, and group channels
						var domainGroupsUrls = [];
						var groupChannelsUrls = [];
						allDomains.forEach(function(domain){
							domainGroupsUrls.push(DOMAIN_GROUPS_URL.replace('%%domainid%%', domain.id));
							domain.groups.forEach(function(group){
								groupChannelsUrls.push(DOMAIN_GROUP_CHANNELS_URL.replace('%%domainid%%', domain.id).replace('%%groupid%%', group.id));
							});
						});
						var combinedUrls = [].concat(domainGroupsUrls).concat(groupChannelsUrls);

						requestN(combinedUrls, function(responses){
							// Get the groups for each domain
							domainGroupsUrls.forEach(function(domainGroupsUrls, i){
								if (responses[domainGroupsUrls] && !responses[domainGroupsUrls].error) {
									allDomains[i].groups = JSON.parse(responses[domainGroupsUrls].body);
								}
							});

							// Get the channel IDs in each group
							allDomains.forEach(function(domain){
								domain.groups.forEach(function(group){
									var groupChannelsUrl = DOMAIN_GROUP_CHANNELS_URL.replace('%%domainid%%', domain.id).replace('%%groupid%%', group.id);
									if (responses[groupChannelsUrl] && !responses[groupChannelsUrl].error) {
										var channels = JSON.parse(responses[groupChannelsUrl].body);
										group.channelIds = channels.map(function(el){return el.id;});
									}
								});
							});

							// Cache the domains
							cache.set('domains-list', allDomains, 3600); // cache for 1 hour
							self.emit('getDomains', allDomains);

						});

					}
				} catch(e) {
					console.log('Failed to retrieve domains');
					console.log(e);
					self.emit('getDomains', allDomains);
				}

			});
		}

		return this;

	};

	/** Get details for a single domain */
	DomainService.prototype.getDomainDetails = function(domainId) {

		var self = this;

		(new DomainService()).once('getDomains', function(domains){

			var domainDetails = {};
			var foundDomains = domains.filter(function(domain){
				return (domain.id===domainId);
			});

			if (foundDomains && foundDomains.length>0) {
				domainDetails = foundDomains[0];
			}
			self.emit('getDomainDetails', domainDetails);

		}).getDomains();

		return this;

	};


	/** @return */

	return DomainService;

});