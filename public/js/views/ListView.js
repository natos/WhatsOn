// ListView.js

define([

	// Dependencies

], function() {

	return Backbone.View.extend({

		el: $('#list'),

		events: {},

		template: _.template('<div>Template</div>'),

		initialize: function() {

		},

		load: function( collection ) {

			this.collection = collection || this.collection;

			this.el.html( this.template( this.collection ) );

			this.trigger('view-created', this);

			this.select();

		},

		select: function() {

			this.btn.addClass('selected');

			this.el.trigger('view-loaded', this);

		},

		unload: function() {

			this.btn.removeClass('selected');

			this.el.html( '' );

			this.el.trigger('view-unloaded', this);

		}

	});



}); // define