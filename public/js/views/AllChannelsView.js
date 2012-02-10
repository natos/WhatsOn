// AllChannelsView.js

define([

	'sources/AllChannelsSource',
	'templates/AllChannelsTemplate'
],

function(Source, template) {

	return Backbone.View.extend({

		el: $('#content')

	,	btn: $('a[href=#allchannels]')

	,	template: _.template( template )

	,	initialize: function() {

			Source.getChannelCollection();

			wo.events.bind('get-channel-collection', this.load, this);

			this.trigger('view-initialized', this);
		}

	,	load: function( collection ) {

			this.collection = collection || this.collection;

			this.el.html( this.template( this.collection ) );

			this.trigger('view-created');

			this.select();

		}

	,	select: function() {

			this.btn.addClass('selected');

			this.trigger('view-loaded');

		}

	,	unload: function() {

			this.btn.removeClass('selected');

			this.el.html( '' );

			this.trigger('view-unloaded', this);

		}

	});

}); // define