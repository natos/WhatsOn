/* 
* ChannelUtils
* ------------
*
*
*/

define([

	'config/channel',
	'models/channel',
	'modules/app'

], function ChannelModuleScope(c, ChannelModel, App) {

	var name = 'channelutils';

/* private */

	/**
	* Process the channel collection, creates a 'groups' collection order by group id
	* to lighting-fast query channels information.
	*/

	function process(data) {

		var groups = {}, byId = {}, group, channel, domain, i, domainIterator, groupIterator, dataLength = data.length;
			// All Zenders collection
			groups['000'] = [];
			// Favorite channels collection
			groups['001'] = [];

		for (i = 0; i < dataLength; i++) {
			channel = data[i];
			// save channel by id
			byId[channel.id] = channel;
			// logo easy access THANK YOU!
			byId[channel.id].logo = getLogo(channel);
			// save channels on All Zenders collection
			groups['000'].push(channel);
			// a little cleanning
			delete channel._type;
			delete channel.apiChannelGroupId;
			delete channel.broadcastFormat;
			delete channel.position;
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
			}
		}

		// TODO: sort channels 

		// Save byId map
		ChannelModel.set(c.BY_ID, byId);
		// Save groups map
		ChannelModel.set(c.GROUPS, groups);
		// Set default selected group
		// TODO: Read user preferences here
		ChannelModel.set(c.SELECTED_GROUP, c.DEFAULT_GROUP);

		// return raw data
		return data;
	}

	// Get the logo of a channel
	function getLogo(channel) {
		if (!channel.links) { return; }
		var foundif = false, t = channel.links.length;
		while (t--) { if (channel.links[t].rel === "logo") { foundit = channel.links[t]; } }
		return foundit;
	}

/* public */

	/**
	* Get the list of channels and continue doing whatever you were doing
	*/
	function fetchChannels(next) {
		// get Channels collection
		$.getJSON('/channels.json', function(data, status, xhr) {
			// continue
			if (next) { next.apply(App, data); }
			process(data);
		});

	}

/* export */

	return {
		name		: name,
		fetchAnd	: fetchChannels
	};

});