// TopBookingsSource.js

define([
	// Dependencies
	'models/ProgrammeModel',
	'collections/TopBookingsCollection',

	'js/utils/prettyDate.js'
], 

function(Model, Collection) {

	//var source = 'http://tvgids.upc.nl/customerApi/wa/topBookings';
	var source = './mock.txt';

	return {

		createCollection: function( response ) {

			var collection = new Collection;

			$(response).each(function(i, arr) {
				$(arr).each(function(e, item) {
					collection.add(new Model({
							'start': prettyDate(item.startDateTime)
						,	'title': item.programme.title
						,	'description': item.programme.shortDescription
						,	'channel': item.channel.name
						})); // new item
				});
			});

			wo.events.trigger('get-topbookings-collection', collection);

		},

		getData: function() {

			return $.getJSON(source);

		},

		getTopBookingsCollection: function() {

			$.when( this.getData() )
			 .then( this.createCollection );

		}

	}


});