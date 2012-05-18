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
	'models/grid',
	'views/grid',
	'utils/epgapi'

], function GridController(g, App, GridModel, GridView, EpgApi) {

/* private */

	function initialize() {

		// Events Handlers
		App.on(g.GRID_MOVED, gridMoved);
		App.on(g.GRID_FETCH_EVENTS, getEvents);
		App.on('eventsReceived', setEvents);

		GridView.initialize();
	
	};

	function finalize() {

		App.off(g.GRID_MOVED, gridMoved);
		App.off(g.GRID_FETCH_EVENTS, getEvents);
		App.off('eventsReceived', setEvents);

		GridView.finalize();

	};
	
	function gridMoved() {
		// Update model UI data
		GridModel.set('position', { 'top': window.pageYOffset * -1, 'left': window.pageXOffset * -1 });
		GridModel.set('selectedChannels', GridView.getSelectedChannels(2));
		GridModel.set('selectedTime', GridView.getSelectedTime());
	
		return this;
	};
	
	function setEvents(events) {
	
		GridModel.set('events', events);
	
		return this;
	
	};
	
	
	function getEvents() {
	
		EpgApi.getEventsForChannels(GridModel.selectedChannels, GridModel.selectedTime.startTime, GridModel.selectedTime.endTime);
	
		return this;
	};


/* @class GridController */
	return {
		name: 'grid',
		/* constructor */
		initialize: initialize,
		view: GridView,
		model: GridModel
	};

});