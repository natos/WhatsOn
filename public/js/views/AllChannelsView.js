// AllChannelsView.js

define([

	'models/ChannelModel',
	'collections/AllChannelsCollection',
	'sources/AllChannelsSource',
	'templates/AllChannelsTemplate'

],

function(ChannelModel, Collection, Source, template) {

	return Backbone.View.extend({

		el: $('#content'),

		btn: $('a[href=#allchannels]'),

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
					self.collection.add(new ChannelModel({
						id: item.id
					,	name: item.name
					,	description: item.description
					,	logoIMG: item.logoIMG
					,	position: item.position
					,	broadcastFormat: item.broadcastFormat
					,	apiChannelGroupId: item.apiChannelGroupId
					})); // new channel
				});
			});

			this.load();

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