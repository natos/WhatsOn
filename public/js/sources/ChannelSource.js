
define([
	// Dependencies
	'models/ChannelModel'
,	'models/EventModel'
,	'collections/EventCollection'

], 

function(ChannelModel, EventModel, EventCollection) {

	var CHANNEL_DETAILS = 'http://tvgids.upc.nl/cgi-bin/WebObjects/EPGApi.woa/api/Channel/%%ID%%.json',
		CHANNEL_EVENTS = 'http://tvgids.upc.nl/cgi-bin/WebObjects/EPGApi.woa/api/Channel/%%ID%%/events/NowAndNext.json'

	return {

		getData: function(id, source) {

			return $.getJSON(source.replace('%%ID%%', id) + '?callback=?' );

		}

	,	getChannelData: function(id) {

			$.when( this.getData(id, CHANNEL_DETAILS) )
			 .then( this.createModel );

			return this;
		}

	,	getChannelEvents: function(id) {

			$.when( this.getData(id, CHANNEL_EVENTS) )
			 .then( this.createEventsCollection );

			return this;
		}

	,	createModel: function( response ) {

			wo.events.trigger('get-channel-data', new ChannelModel(response) );

		}

	,	createEventsCollection: function( response ) {

			wo.events.trigger('get-channel-events', new EventCollection(response) );

		}

	}


});