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
	'controllers/app',
	'models/grid',
	'views/grid',
	'components/timebar',
	'components/channelbar',
	'components/buffer',
	'utils/epgapi'

], function GridController(g, App, GridModel, GridView, TimeBar, ChannelBar, Buffer, EpgApi) {

/* private */

	function initialize() {
	
		App.controllers.grid = this;

		// Events Handlers
		App.on(g.GRID_MOVED, gridMoved);
		App.on(g.GRID_FETCH_EVENTS, getEvents);
		App.on('eventsReceived', setEvents);
	
	}
	
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
		/* constructor */
		initialize: initialize,
		view: GridView.initialize(),
		model: GridModel.initialize(),
		/* setup components */
		components: {
			timebar		: TimeBar.initialize(),
			channelbar	: ChannelBar.initialize(),
			buffer		: Buffer.initialize()
		}
	};

});