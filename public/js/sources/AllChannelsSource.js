
define([
	// Dependencies
	'models/ChannelModel',
	'collections/AllChannelsCollection'
], 

function(Model, Collection){

	var source = 'http://tvgids.upc.nl/cgi-bin/WebObjects/EPGApi.woa/api/Channel.json';

	return {
		
		createCollection: function( response ) {

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

		},

		getData: function() {

			return $.getJSON(source + '?callback=?' );

		},

		getChannelCollection: function() {

			$.when( this.getData() )
			 .then( this.createCollection );

		}

	}


});