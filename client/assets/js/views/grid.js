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

	$CUSTOM_EVENT_ROOT = $(document.body),

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

		return this;

	};

	return GridView;

});