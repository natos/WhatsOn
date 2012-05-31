/* 
* GridConfig
* --------------
*
* Constants and configurations for Grid
*
*/

define([], function GridConfig() {

/* private */

/* public */

/* @class GridConfig */
	return {

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

		MAX_DOM_ELEMENTS: 500,

		// Events

		MODEL_CHANGED: 'grid:model_changed',

		GRID_FETCH_EVENTS: 'grid:fetch_events',

		GRID_MOVED: 'grid:moved',

		GRID_RENDERED: 'grid:rendered'
	
	};

});