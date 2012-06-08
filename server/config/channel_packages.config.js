/**
 *	Config for Channel packages
 */

define([
],

/**
 *	@class ChannelPackages
 *	@static
 */

function() {

	var channelPackages = {
		'nl-all' : {
			'id' : 'nl-all',
			'marketId' : 'nl',
			'title' : 'Alle Zenders',
			'description' : '',
			'channelIds' : []
		},
		'nl-dtv-s' : {
			'id' : 'nl-dtv-s',
			'marketId' : 'nl',
			'title' : 'Digitale TV Starter',
			'description' : '',
			'channelIds' : ['7J','6s','7G','7K','7L','6x','7M','8h','7N','8i','8C','7Q','6r','6t','9b','7S','8E','9X','7R','8j','87','7H','7T','7j','7k','7l','8u','81','6w','7I','83','9E','84','85','88','8I','8J','7B','8L','8w','8M','8N','8O','8y','b6','6n']
		},
		'nl-dtv-r' : {
			'id' : 'nl-dtv-r',
			'marketId' : 'nl',
			'title' : 'Digitale TV Royaal',
			'description' : '',
			'channelIds' : []
		},
		'nl-hd' : {
			'id' : 'nl-hd',
			'marketId' : 'nl',
			'title' : 'HD',
			'description' : '',
			'channelIds' : []
		}
	};

	/** @return */

	return channelPackages;

});