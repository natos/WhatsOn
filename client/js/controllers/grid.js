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
	'utils/epgapi'

], function GridController(g, App, Controller, GridModel, GridView, EpgApi) {

	var name = 'grid';

/* private */

	/**
	* Handler for the GRID_MOVED event.
	* GRID_MOVED is raised by the grid view whenever the visible channel range
	* or time window changes.
	*/
	function gridMoved() {
		// Update model UI data
		GridModel.set('position', { 'top': window.pageYOffset * -1, 'left': window.pageXOffset * -1 });
		GridModel.set('selectedChannels', GridView.getSelectedChannels(2));
		GridModel.set('selectedTime', GridView.getSelectedTime());
	
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

		// get slices

		var timeSlices = EpgApi.getTimeSlices(GridModel.selectedTime.startTime, GridModel.selectedTime.endTime),
			slicesCount = timeSlices.length,
			i;

		for (i=0; i<slicesCount; i++) {
			EpgApi.getEventsForSlice(GridModel.selectedChannels, timeSlices[i]);
		}

		// get cache key

		// check the cache

			// return if theres data

		// or fetch slices for channels

	//	EpgApi.getEventsForChannels(GridModel.selectedChannels, GridModel.selectedTime.startTime, GridModel.selectedTime.endTime);
	
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