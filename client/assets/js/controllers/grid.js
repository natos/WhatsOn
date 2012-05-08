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
	'components/Timebar',
	'components/ChannelBar',
	'utils/epgapi'

], function(g, App, GridModel, GridView, TimeBar, ChannelBar, EpgApi) {

/* private */

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
var GridController = {};

	/* constructor */
	GridController.initialize = function() {

		upc.views.grid = this;

	/** 
	*	Modules Setup
	*/
		this.model = GridModel.initialize();
		this.view = GridView.initialize();

		// setup components
		this.components = {
			timebar		: TimeBar.initialize(),
			channelbar	: ChannelBar.initialize(),
			buffer		: Buffer.initialize()
		};

		// Events Handlers
		upc.on(g.GRID_MOVED, gridMoved);
		upc.on(g.GRID_FETCH_EVENTS, getEvents);
		upc.on('eventsReceived', setEvents);

	};

	return GridController;

});