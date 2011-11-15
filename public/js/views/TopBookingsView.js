// TopBookingsView.js

define([

	'models/ItemModel',
	'collections/TopBookingsCollection',
	'sources/TopBookingsSource',

	'js/utils/prettyDate.js'
],

function(ItemModel, Collection, Source) {

	return Backbone.View.extend({

		el: $('#topbookings'),

		events: {},

		template: _.template( $('#topbookings-template').html() ),

		initialize: function() {

			var collection = this.collection = new Collection();

			$.when( Source.getData() )
			 .then( $.proxy( function( response ) {

				// iterate
				$(response).each(function(i, arr) {

					$(arr).each(function(e, item) {

						collection.add(new ItemModel({
								'start': prettyDate(item.startDateTime)
							,	'title': item.programme.title
							,	'description': item.programme.shortDescription
							,	'channel': item.channel.name
							})); // new item
					});
				});

				this.render();

			}, this ) );

		},

		render: function() {

			this.el.html( this.template( this.collection ) );

			this.el.page()

			this.el.trigger("pagecreate");

			$.mobile.changePage( this.el , { transition: "slidedown"} );

		},

		select: function() {
		
			$.mobile.changePage( this.el , { transition: "slidedown"} );

		}

	});



}); // define