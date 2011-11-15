// AllChannelsView.js

define([

	'models/ChannelModel',
	'collections/AllChannelsCollection',
	'sources/AllChannelsSource'

],

function(ChannelModel, Collection, Source) {

	return Backbone.View.extend({

		el: $('#allchannels'),

		events: {},

		template: _.template( $('#allchannels-template').html() ),

		initialize: function() {

			var collection = this.collection = new Collection();

			$.when( Source.getData() )
			 .then( $.proxy( function( response ) {

				// iterate
				$(response).each(function(i, arr) {

					$(arr).each(function(e, item) {

						collection.add(new ChannelModel({
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

				this.render();

			}, this ) );

		},

		render: function() {

			$.mobile.showPageLoadingMsg();

			this.el.html( this.template( this.collection ) );

			this.el.page();

			this.select();

			this.trigger("pagecreate");

			$.mobile.hidePageLoadingMsg();

		},

		select: function() {
		
			$.mobile.changePage( this.el , { transition: "slidedown"} );

		}

	});



}); // define