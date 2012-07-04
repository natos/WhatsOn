/* 
* GridController 
* --------------
*
* Listen to the views
* Updates the model
*
*/

define([

	'config/grid',
	'modules/app',
	'lib/flaco/controller',
	'models/grid',
	'views/grid',
	'utils/epgapi',
	'utils/convert'

], function GridController(g, App, Controller, GridModel, GridView, EpgApi, convert) {

	var name = 'grid';

/* private */

	var gridMoveExecutionTimer,
		gridMoveExecutionDelay = 100;

	/**
	* Handler for the GRID_MOVED event.
	* GRID_MOVED is raised by the grid view whenever the visible channel range
	* or time window changes.
	*/
	function gridMoved() {
		// Update model UI data:

		// Update position immediately; this is used for updating 
		// the channelbar and timebar scroll positions
		GridModel.set('position', { 'top': window.pageYOffset * -1, 'left': window.pageXOffset * -1 });

		// Delay updating the selectedChannels and selectedTime values.
		// We don't need to trigger the dependent events (fetch data)
		// with _every_ onscroll event, especially on slow (Android) devices.

		// erase the previous timer
		if (gridMoveExecutionTimer) { clearTimeout(gridMoveExecutionTimer); }
		// set a delay before rendering the logos
		gridMoveExecutionTimer = setTimeout(function () {
			GridModel.set('selectedChannels', GridView.getSelectedChannels(2));
			GridModel.set('selectedTime', GridView.getSelectedTime());
		}, gridMoveExecutionDelay);
	
		return this;
	}
	
	/**
	* Handler for the "eventsReceived" event.
	* "eventsReceived" is raised by the EpgApi.js object whenever a batch of EPG data
	* has been retrieved from the API, or from cache.
	*/
	function setEvents(events) {

		GridModel.set('events', events);
	
		return this;
	
	}
	
	/**
	* Handler for the GRID_FETCH_EVENTS event.
	* GRID_FETCH_EVENTS is raised by the grid view at the *end* of a resize or scroll
	* action, to indicate that the user has finished their immediate interaction,
	* and we should now retrieve grid data.
	*/
	function getEvents() {

		//EpgApi.getEventsForChannels(GridModel.selectedChannels, GridModel.selectedTime.startTime, GridModel.selectedTime.endTime);


		/********************
		*					*
		*	Qualifiers!!!	*
		*					*
		********************/

		// extra querystring parameters
		var querystring = '&batchSize=8&order=startDateTime&optionalProperties=Programme.subcategory&callback=?',
		// define time slices
		timeSlices = EpgApi.getTimeSlices(GridModel.selectedTime.startTime, GridModel.selectedTime.endTime),		
		// grab selected channels
		selectedChannels = GridModel.selectedChannels.slice(0, GridModel.selectedChannels.length),
		// iteration helpers
		sliceOfChannels = true, URL, i, t;

		// for all channel slices
		while (sliceOfChannels) {

			// group by 5 channels
			sliceOfChannels = selectedChannels.splice(0,5);

			// if there is no more channels stop
			if (sliceOfChannels.length === 0) { 
				sliceOfChannels = false;
			} else {
				// iterate timeslices
				t =  timeSlices.length;
				for ( i = 0; i < t; i++) {
					// construct a URL to request
					URL = 'http://tvgids.upc.nl/cgi-bin/WebObjects/EPGApi.woa/api/Channel/' + sliceOfChannels.join('%7C') + '/events.json?qualifier=startDateTime%3E=@{timestamp%20' + EpgApi.formatTimeForApiRequest(timeSlices[i][0]) + '}%20and%20endDateTime%3C@{timestamp%20' + EpgApi.formatTimeForApiRequest(timeSlices[i][1]) + '}' + querystring;

//http://tvgids.upc.nl/cgi-bin/WebObjects/EPGApi.woa/api/Channel/7L%7C6x%7C7M%7C8h%7C7N/events.json?qualifier=startDateTime%3E=@{timestamp%202012-07-04T12:00Z}%20and%20endDateTime%3C@{timestamp%202012-07-04T16:00Z}&batchSize=8&order=startDateTime&optionalProperties=Programme.subcategory&callback=jsonp7

					$.getJSON(URL, setEvents);


				}
			}

		}

		return this;
	}

/* public */

/* abstract */

	function initialize() {

		// Events Handlers
		App.on(g.GRID_MOVED, gridMoved);
		App.on(g.GRID_FETCH_EVENTS, getEvents);
		App.on('eventsReceived', setEvents); // NS: don't like this string there…

		return this;

	}

	function finalize() {

		App.off(g.GRID_MOVED, gridMoved);
		App.off(g.GRID_FETCH_EVENTS, getEvents);
		App.off('eventsReceived', setEvents); // NS: don't like it here either…

		return this;

	}

/* export */

	return new Controller({
		name		: name,
		initialize	: initialize,
		finalize	: finalize,
		model		: GridModel,
		view		: GridView
	});

});