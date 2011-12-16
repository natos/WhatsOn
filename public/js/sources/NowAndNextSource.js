
define([
	// Dependencies
	'models/NowAndNextModel',
	'collections/NowAndNextCollection',

	'js/utils/prettyDate.js'
], 

function(Model, Collection){

	var source = 'http://tvgids.upc.nl/scheduleApi/api/Channel/7J%7C6s%7C7G%7C7K%7C7L/events/NowAndNext.json?optionalProperties=Channel.url%2CChannel.logoIMG%2CEvent.url&order=startDateTime';//&batchSize=2&batch=0';

	return {

		createCollection: function( response ) {

			var collection = new Collection;

			$(response).each(function(i, arr) {
				$(arr).each(function(e, item) {
					collection.add(new Model({
							'start': prettyDate(item.startDateTime)
						,	'programme': {
								'title': item.programme.title
							,	'shortDescription': item.programme.shortDescription
							}
						,	'channel': {
								'name': item.channel.name
							,	'logoIMG': item.channel.logoIMG
							,	'url': item.channel.url
							}
						,	'url': item.url
						})); // new item
				});
			});

			wo.events.trigger('get-nowandnext-collection', collection);

		},
		
		getData: function() {

			return $.getJSON(source + '&callback=?' );

		},

		getNowAndNextCollection: function() {
		
			$.when( this.getData() )
			 .then( this.createCollection );
		
		}

	}


});