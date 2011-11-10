// ListView.js

define([

	// Dependencies

], function() {

	return Backbone.View.extend({

		el: $('#list'),

		events: {},

		template: _.template( $('#item-template').html() ),

		initialize: function() {

		},

		render: function( model ) {
	
			this.el.html( this.template( model ) );

			this.el.listview('refresh');

			return this;

		}

	});



}); // define