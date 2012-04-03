
define([
	// Dependencies
	'models/ProgrammeModel'
,	'models/EventModel'
,	'collections/EventCollection'
], 

function(ChannelModel, EventModel, EventCollection) {

	var PROGRAMME_DETAILS = 'http://tvgids.upc.nl/cgi-bin/WebObjects/EPGApi.woa/api/Programme/%%ID%%.json',
		PROGRAMME_EVENTS = 'http://tvgids.upc.nl/cgi-bin/WebObjects/EPGApi.woa/api/Programme/%%ID%%/events.json'

	return {

		getData: function(id, source) {

			return $.getJSON(source.replace('%%ID%%', id) + '?callback=?' );

		}

	,	getProgrammeData: function(id) {

			$.when( this.getData(id, PROGRAMME_DETAILS) )
			 .then( this.createModel );

			return this;
		}

	,	getProgrammeEvents: function(id) {

			$.when( this.getData(id, PROGRAMME_EVENTS) )
			 .then( this.createEventsCollection );

			return this;
		}

	,	createModel: function( response ) {

			wo.events.trigger('get-programme-data', new ChannelModel(response) );

		}

	,	createEventsCollection: function( response ) {

			wo.events.trigger('get-programme-events', new EventCollection(response) );

		}

	}


});