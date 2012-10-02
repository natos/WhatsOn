/* 
* ChannelUtils
* ------------
*
*
*/

define([

	'config/app',
	'config/channel',
	'models/channel',
	'modules/app',
	'modules/event'

], function ChannelModuleScope(a, c, ChannelModel, App, Event) {

	var name = 'channelutils';

	Event.on(a.MODEL_CHANGED, function(changes) {
		// process new lineup
		if (changes[a.LINEUP_CACHE]) {
			process(changes[a.LINEUP_CACHE])
		}
	});
	
/* private */

	// Get the logo of a channel
	function getLogo(channel) {
		if (!channel.links) { return; }
		var foundif = false, t = channel.links.length;
		while (t--) { if (channel.links[t].rel === "logo") { foundit = channel.links[t]; } }
		return foundit;
	}

/* public */

	/**
	* Process the channel collection, creates a 'groups' collection order by group id
	* to lighting-fast query channels information.
	*/

	function process(lineup) {

		var data = lineup.data, groups = {}, byId = {}, group, channel, domain, i, domainIterator, groupIterator, dataLength = data.length;
			// All Zenders collection
			groups['000'] = [];
			// Favorite channels collection
			groups['001'] = [];

		for (i = 0; i < dataLength; i++) {
			channel = data[i];
			channel.channelId = channel.channel.id;
			// save channel by id
			byId[channel.id] = channel;
			// logo easy access THANK YOU!
			byId[channel.id].logo = channel.logoLink.href;
			// save channels on All Zenders collection
			groups['000'].push(channel);
			// a little cleanning
			delete channel.logoLink;
			delete channel.logicalPosition;
			delete channel.channel;
			
			/*
			// iterate domains
			domainIterator = channel.domains.length;
			while(domainIterator--) {
				domain = channel.domains[domainIterator];
				// domain cleanning
				groupIterator = domain.groups.length;
				while(groupIterator--) {
					group = domain.groups[groupIterator];
					if (!groups[group]) { groups[group] = []; }
					groups[group].push(channel);
				}
			}*/
		}

		// TODO: sort channels 

		// Save byId map
		ChannelModel.set(c.BY_ID, byId);
		// Save groups map
		ChannelModel.set(c.GROUPS, groups);
		// Set default selected group
		// ATTENTION: Read user preferences here
		ChannelModel.set(c.SELECTED_GROUP, c.DEFAULT_GROUP);

		// return raw data
		return data;
	}

/* export */

	return {
		name	: name,
		process	: process
	};

});