define([

], function() {

/* private */


/* Grid Config */

	var config = {

		// constants

		ZERO: (function(){

			var _ZERO = new Date();
				_ZERO.setHours(0);
				_ZERO.setMinutes(0);
				_ZERO.setSeconds(0);

			return _ZERO;

		}()),

		NOW: new Date(),
	
		HOUR_WIDTH: 200,
	
		ROW_HEIGHT: 60,
	
		MILLISECONDS_IN_HOUR: 3600000,
	
		TIMEBAR_HEIGHT: 0,
	
		CHANNELS_COUNT: 0,
	
		CHANNEL_BAR_WIDTH: 0,
	
		VIEWPORT_WIDTH_HOURS: 0,

		// Events

		GRID_MOVED: 'grid:moved',

		GRID_RENDERED: 'grid:rendered',

		// DOM Access

		$window: $(window),
	
		$body: $(document.body),
	
		$container: $('#grid-container'),
	
		$timebar: $('#time-bar'),
	
		$channelsbar: $('#channels-bar'),
	
		$navbar: $('.navbar'),
	
		$styles: $('#grid-styles'),

		// Viewport styling

		getStyles: function() {

			var cssText = [];
			// define constants
			this.TIMEBAR_HEIGHT = this.$timebar.height();
			this.CHANNELS_COUNT = this.$channelsbar.find('li').length;
			this.CHANNEL_BAR_WIDTH = this.$channelsbar.width();
			this.VIEWPORT_WIDTH_HOURS = (document.body.clientWidth - this.CHANNEL_BAR_WIDTH) / this.HOUR_WIDTH;
			// Size the grid
			this.GRID_HEIGHT = this.ROW_HEIGHT * this.CHANNELS_COUNT;
			this.GRID_WIDTH = this.HOUR_WIDTH * 24;
	
			// Generate style rules for the heights and widths specific to the current browser
			cssText.push('#grid-container {height:' + this.GRID_HEIGHT + 'px;width:' + this.GRID_WIDTH + 'px;margin-left:' + this.CHANNEL_BAR_WIDTH + 'px;margin-top:' + this.TIMEBAR_HEIGHT + 'px;}');
			cssText.push('#grid-container .event {height:' + this.ROW_HEIGHT + 'px;}');
			cssText.push('#channels-bar li {height:' + this.ROW_HEIGHT + 'px;}');
			cssText.push('#time-bar ol {width:' + this.GRID_WIDTH + 'px;margin-left:' + this.CHANNEL_BAR_WIDTH + 'px;}');
			cssText.push('#time-bar li {width:' + this.HOUR_WIDTH + 'px;}');
			cssText.push('.channel-container {height:' + this.ROW_HEIGHT + 'px;}');

			return cssText.join('\n');

		},

		setStyles: function() {

			this.$styles.text( this.getStyles() );

		},

		initialize: function() {

			this.setStyles();

		}

	};

	return config;

});