define([

	'controllers/app',
	'controllers/grid',
	'models/grid',
	'components/timebar',
	'components/channelbar',
	'utils/viewport',
	'utils/epgapi'

], function(App, GridController, GridModel, TimeBar, ChannelBar, Viewport, EpgApi) {

/* private */

var $window = $(window),

	$container = $('#grid-container');

/* @class GridView */
var GridView = {};

	/* constructor */
	GridView.initialize = function() {

		// Let the App know your here
		App.views.grid = this;

		// setup model
		this.model = GridModel.initialize();
		// setup controller
		this.controller = GridController.initialize();
		// setup components
		this.components = {
			timebar		: TimeBar.initialize(),
			channelbar	: ChannelBar.initialize()
		};

		// Start listening for eventsReceived event
		$(window).bind('eventsReceived', function(e, data){
			console.log(data);
		});
		var channelIds = ['7s','7l','6s'];
		var startTime = new Date();
		var endTime = new Date(startTime.valueOf() + (4 * 60 * 60 * 1000));
		EpgApi.getEventsForChannels(channelIds, startTime, endTime);

		return this;

	};

	return GridView;

});