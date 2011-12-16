// NowAndNextView.js

define([

	'sources/NowAndNextSource',
	'templates/NowAndNextTemplate'

],

function(Source, template) {

	return Backbone.View.extend({

		el: $('#content'),

		btn: $('a[href=#nowandnext]'),

		template: _.template( template ),

		initialize: function() {

			var self = this;

			this.collection = Source.getNowAndNextCollection();

			_.sortBy(this.collection, function(item){
				return item.start;
			});

			wo.events.bind('get-nowandnext-collection', this.load, this);

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

			this.el.trigger('view-loaded', this);

		},

		unload: function() {

			this.btn.removeClass('selected');

			this.el.html( '' );

			this.el.trigger('view-unloaded', this);

		}

	});



}); // define