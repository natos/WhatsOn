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

		targetTime = targetTime || new Date();
		var zeroTime = new Date(targetTime.valueOf() - (6 * 60 * 60 * 1000));
		zeroTime.setMinutes(0);
		zeroTime.setSeconds(0);
		return zeroTime;

	};

	var _zeroTime = setZeroTime();


/* public */

/* export */

	return {

		/* constants */

		HOUR_WIDTH: 200,
	
		ROW_HEIGHT: 60,
	
		MILLISECONDS_IN_HOUR: 3600000,
	
		TIMEBAR_HEIGHT: 25,
	
		CHANNEL_BAR_WIDTH: 55,
	
		VIEWPORT_WIDTH_HOURS: 0,

		EXTRA_ABOVE_AND_BELOW: 2,

		EXECUTION_DELAY: 250,

		/* slices size */

		HOURS_PER_SLICE: 6,
		
		CHANNELS_PER_SLICE: 15,

		/* labels */

		RENDER: 'render',

		OVERLAY: 'overlay',

		POSITION: 'position',

		SELECTED_CHANNELS: 'selectedChannels',

		SELECTED_TIME: 'selectedTime',

		SLICE_CACHE: 'sliceCache',

		/* properties */

		zeroTime: _zeroTime,

		/* methods */

		setZeroTime: setZeroTime,

		/* events */

		MOVED: 'grid:moved',

		RENDERED: 'grid:rendered',

		MODEL_CHANGED: 'grid:model_changed',

		FETCH_EVENTS: 'grid:fetch_events',

		EVENTS_RECEIVED: 'grid:events_received',

		FETCH_EVENT: 'grid:fetch_event',

		EVENT_RECEIVED: 'grid:event_received',
	
	};

});