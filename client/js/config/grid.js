/* 
* GridConfig
* --------------
*
* Constants and configurations for Grid
*
*/

define([], function GridConfigContext() {

/* private */

	/**
	 * For displaying a time window of 24 hours, we want to
	 * place the "now" time at 25% of the window, so that
	 * zero time is now - 6 hours.
	 * @param {Date} targetDateTime optional
	 * @private
	 */
	var setZeroTime = function(targetTime) {

		var targetTime = targetTime || new Date();
		var zeroTime = new Date(targetTime.valueOf() - (6 * 60 * 60 * 1000));
		zeroTime.setMinutes(0);
		zeroTime.setSeconds(0);

		return zeroTime;

	}

	var _zeroTime = setZeroTime();


/* public */

/* export */

	return {

		/* constants */

		HOUR_WIDTH: 200,
	
		ROW_HEIGHT: 60,
	
		MILLISECONDS_IN_HOUR: 3600000,
	
		TIMEBAR_HEIGHT: 30,
	
		CHANNEL_BAR_WIDTH: 55,
	
		VIEWPORT_WIDTH_HOURS: 0,

		MAX_DOM_ELEMENTS: 500, // deprecated

		EXTRA_ABOVE_AND_BELOW: 2,

		EXECUTION_DELAY: 250,

		/* labels */

		POSITION: 'position',

		SELECTED_CHANNELS: 'selectedChannels',

		SELECTED_TIME: 'selectedTime',

		CHANNEL_SLICE_CACHE: 'channelSliceCache',

		/* properties */

		zeroTime: _zeroTime,

		/* methods */

		setZeroTime: setZeroTime,

		/* events */

		EVENTS_RECEIVED: 'grid:eventsReceived',

		MODEL_CHANGED: 'grid:model_changed',

		GRID_FETCH_EVENTS: 'grid:fetch_events',

		GRID_MOVED: 'grid:moved',

		GRID_RENDERED: 'grid:rendered',

		GRID_EVENTS_RECIEVED: 'grid:events_received'
	
	};

});