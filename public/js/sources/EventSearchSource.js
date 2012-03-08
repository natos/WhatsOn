/** EventSearchSource
* Data source for finding events
*/
define([
	// Dependencies
	'models/EventModel'
,	'collections/EventCollection'
], 

function(EventModel, EventCollection) {

	var handleEventSearchResults = function( response ) {
		// response should be an array of objects.
		// each object maps directly to an EventModel.
		eventModelsCollection = new EventCollection(response);

		wo.event.trigger('search-results-events', eventModelsCollection);
	}

	return {

		getEventsCollectionForQuery: function(query) {
			var searchUrl = 'http://tvgids.upc.nl/cgi-bin/WebObjects/EPGApi.woa/api/Event.json?query=' + query + '&callback=?';
			$.when( $.getJSON(searchUrl) )
			 .then( handleEventSearchResults );

			return this;
		}

	}


});