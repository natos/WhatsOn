// TopBookingsView.js

define([

	'sources/TopBookingsSource',
	'templates/TopBookingsTemplate'

],

function(Source, template) {

	return Backbone.View.extend({

		el: $('#content'),

		btn: $('a[href=#topbookings]'),

		template: _.template( template ),

		initialize: function() {

			Source.getTopBookingsCollection();

			wo.events.bind('get-topbookings-collection', this.load, this);

			this.trigger('view-initialized', this);

		},

		load: function( collection ) {

			this.collection = collection || this.collection;

			this.el.html( this.template( this.collection ) );

			this.trigger('view-created', this);

			this.select();
			
		},

		select: function() {

			this.btn.addClass('selected');

			this.trigger('view-loaded', this);

		},

		unload: function() {

			this.btn.removeClass('selected');

			this.el.html( '' );

			this.trigger('view-unloaded', this);

		}
		

	});



}); // define