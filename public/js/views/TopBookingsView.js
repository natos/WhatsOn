// TopBookingsView.js

define([

	'models/ProgrammeModel',
	'collections/TopBookingsCollection',
	'sources/TopBookingsSource',
	'templates/TopBookingsTemplate',

	'js/utils/prettyDate.js'
],

function(Model, Collection, Source, template) {

	return Backbone.View.extend({

		el: $('#content'),

		btn: $('a[href=#topbookings]'),

		template: _.template( template ),

		initialize: function() {

			this.collection = new Collection();

			$.when( Source.getData() )
			 .then( $.proxy( this.iterate , this ) );

		},

		iterate: function( response ) {

			var self = this;

			$(response).each(function(i, arr) {
				$(arr).each(function(e, item) {
					self.collection.add(new Model({
							'start': prettyDate(item.startDateTime)
						,	'title': item.programme.title
						,	'description': item.programme.shortDescription
						,	'channel': item.channel.name
						})); // new item
				});
			});

			self.load();

		},

		load: function() {

			this.el.html( this.template( this.collection ) );

			this.trigger('view-created');

			this.select();
			
		},

		select: function() {

			this.btn.addClass('selected');

			this.el.trigger('view-loaded');

		},

		unload: function() {

			this.btn.removeClass('selected');

			this.el.html( '' );

		}
		

	});



}); // define