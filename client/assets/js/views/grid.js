define([

	'controllers/app',
	'controllers/grid',
	'models/grid',
	'components/timebar',
	'components/channelbar',
	'utils/viewport'

], function(App, GridController, GridModel, TimeBar, ChannelBar, Viewport) {

/* private */

var $window = $(window),

	$body = $(document.body),

	$container = $('#grid-container'),

	$timebar = $('#time-bar'),

	$channelsbar = $('#channels-bar'),

	$navbar = $('.navbar'),

	$styles = $('#grid-styles'),

	adaptToViewport = function() {

	var cssText = [],
		// TODO: Adjust hour width and row height based on screen size.
		HOUR_WIDTH = 200, // px
		ROW_HEIGHT = 60, // px
		TIMEBAR_HEIGHT = $timebar.height(),
		CHANNELS_COUNT = $channelsbar.find('li').length,
		CHANNEL_BAR_WIDTH = $channelsbar.width(),
		VIEWPORT_WIDTH_HOURS = (document.body.clientWidth - this.CHANNEL_BAR_WIDTH) / this.HOUR_WIDTH,

		// Size the grid
		gridHeight = ROW_HEIGHT * CHANNELS_COUNT,
		gridWidth = HOUR_WIDTH * 24;

		// Generate style rules for the heights and widths specific to the current browser
		cssText.push('#grid-container {height:' + gridHeight + 'px;width:' + gridWidth + 'px;margin-left:' + CHANNEL_BAR_WIDTH + 'px;margin-top:' + TIMEBAR_HEIGHT + 'px;}');
		cssText.push('#grid-container .event {height:' + ROW_HEIGHT + 'px;}');
//		cssText.push('#channels-bar {height:' + gridHeight + 'px}');
		cssText.push('#channels-bar li {height:' + ROW_HEIGHT + 'px;}');
//		cssText.push('#time-bar {width:' + gridWidth + 'px;}');
		cssText.push('#time-bar ol {width:' + gridWidth + 'px;margin-left:' + CHANNEL_BAR_WIDTH + 'px;}');
		cssText.push('#time-bar li {width:' + HOUR_WIDTH + 'px;}');
		cssText.push('.channel-container {height:' + ROW_HEIGHT + 'px;}');

		$styles.html(cssText.join('\n'));

		// Map Channel ID / OffsetTop
		for (var i = 0; i < channels.length; i++) {
			GridView.channelsOffsetMap[ channels[i].id ] = i * ROW_HEIGHT;
		}
	},

	createMovingHandlers = function() {
	
		var executionTimer;

		var handler = function(e) {

			$body.trigger('grid:moved');

			if (executionTimer) {
				clearTimeout(executionTimer);
			}

			executionTimer = setTimeout(function() {

				// ask for events

			}, 200);

		}

		$window.on('scroll', handler);

	};

/* @class GridView */
var GridView = {};

	GridView.$ = $container;

	GridView.config = {
		width: 200,
		height: 60
	}

	GridView.channelsOffsetMap = {};

	/* constructor */
	GridView.initialize = function() {

		// Let the App know your here
		App.views.grid = this;

		// adapt to viewport
		adaptToViewport();

		// scrolling handlers
		createMovingHandlers();

		/* setup */
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