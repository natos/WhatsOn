// NowAndNextView.js

define([

	'models/NowAndNextModel',
	'collections/NowAndNextCollection',
	'sources/NowAndNextSource',
	'templates/NowAndNextTemplate',

	'js/utils/prettyDate.js'
],

function(Model, Collection, Source, template) {

	return Backbone.View.extend({

		el: $('#content'),

		btn: $('a[href=#nowandnext]'),

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