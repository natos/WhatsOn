
define([
	// Dependencies
	'models/ChannelModel',
	'collections/AllChannelsCollection'
], 

function(Model, Collection){


/**

[2/9/12 5:28:32 PM] jsobanski: list of channels: tvgids.upc.nl/cgi-bin/WebObjects/EPGApi.woa/api/Channel/?order=position&batch=0
[2/9/12 5:29:19 PM] jsobanski: http://tvgids.upc.nl/cgi-bin/WebObjects/EPGApi.woa/api/Channel/7J/events/NowAndNext.json
[2/9/12 5:29:46 PM] jsobanski: http://tvgids.upc.nl/cgi-bin/WebObjects/EPGApi.woa/api/Channel/7J/events/NowAndNext/132806669/programme.json

*/

	var source = 'http://tvgids.upc.nl/cgi-bin/WebObjects/EPGApi.woa/api/Channel.json';

	return {

		getData: function() {

			return $.getJSON(source + '?callback=?' );

		}

	,	getChannelCollection: function() {

			$.when( this.getData() )
			 .then( this.createCollection );

		}

	,	createCollection: function( response ) {

			var collection = new Collection();

			$(response).each(function(i, arr) {
				$(arr).each(function(e, item) {
					collection.add(new Model({
						id: item.id
					,	name: item.name
					,	description: item.description
					,	logoIMG: item.logoIMG
					,	position: item.position
					,	broadcastFormat: item.broadcastFormat
					,	apiChannelGroupId: item.apiChannelGroupId
					})); // new channel
				});
			});

			wo.events.trigger('get-channel-collection', collection);

		}

	}


});