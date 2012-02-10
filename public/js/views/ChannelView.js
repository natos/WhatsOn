// ChannelView.js

define([

	'sources/ChannelSource'
,	'templates/ChannelTemplate'
,	'templates/EventsTemplate'

],

function(Source, channelTemplate, eventsTemplate) {

	return Backbone.View.extend({

		el: $('#content')

	,	btn: $('a[href=#allchannels]')

	,	template: _.template( channelTemplate )

	,	eventsTemplate: _.template( eventsTemplate )

	,	initialize: function(id) {

			Source.getChannelData(id).getChannelEvents(id);

			wo.events.bind('get-channel-data', this.load, this);

			wo.events.bind('get-channel-events', this.renderEvents, this);

			this.trigger('view-initialized', this);
		}

	,	load: function( model ) {

			this.model = this.model || model;

			this.el.html( this.template( this.model.toJSON() ) );

			this.trigger('view-created');

			this.select();

			if (this.collection) {
				this.renderEvents( this.collection );
			}

		}

	,	renderEvents: function( collection ) {

			this.collection = this.collection || collection;

			this.el.find('#events').html( this.eventsTemplate( collection ) );

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