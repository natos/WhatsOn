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

	// shift
	var shift = Array.prototype.shift;

	/**
	 * Process the channel collection, creates a 'groups' collection order by group id
	 * to lighting-fast query channels information.
	 */

	function process(data) {

		var groups = {}, group, channel, domain, iterator = data.length, domainIterator, groupIterator;

		while (iterator--) {
			channel = data[iterator];
			domainIterator = channel.domains.length;
			while(domainIterator--) {
				domain = channel.domains[domainIterator];
				groupIterator = domain.groups.length;
				while(groupIterator--) {
					group = domain.groups[groupIterator];
					if (!groups[group]) { groups[group] = []; }
					groups[group].push(channel);
				}
			}
		}

		// TODO: sort channels 

		// Save raw collection
		ChannelModel.set(c.DATA, data);
		// Save groups map
		ChannelModel.set(c.GROUPS, groups);
		// Set default selected group
		// TODO: Read user preferences here
		ChannelModel.set(c.SELECTED_GROUP, c.DEFAULT_GROUP);

		// return raw data
		return data;
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