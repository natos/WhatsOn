// App.js 

define([

		// Dependencies
		'models/ItemModel',
		'collections/ListCollection',
		'views/ListView',

		'js/utils/prettyDate.js'

], function(ItemModel, ListCollection, ListView) {

	Backbone.emulateJSON = true;

	var _app = Backbone.View.extend({

		el: $('#appview'),

		events: {},

		initialize: function() {

			var self = this;
			
				self.list = new ListCollection();

			$.when( this.getData() )
			 .then( $.proxy( function( response ) {

				// iterate
				$(response).each(function(i, arr) {

					$(arr).each(function(e, item) {

						self.list.add(new ItemModel({
								'start': prettyDate(item.startDateTime)
							,	'title': item.programme.title
							,	'description': item.programme.shortDescription
							,	'channel': item.channel.name
							})); // new item
					});
				});

				self.list.refresh();
				
			}, this ) );

		},

		getData: function() {

			return $.getJSON('./mock.txt');
			//return $.getJSON('http://tvgids.upc.nl/customerApi/wa/topBookings?callback=?');

		}

	});

	return _app;

}); // define