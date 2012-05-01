define([

	'config/grid'

], function(g) {

/* private */

var	$timelist = g.$timebar.find('ol'),

/* @class TimeBar */
	TimeBar = {};

	/* constructor */
	TimeBar.initialize = function() {

		g.$body.on('grid:moved', this.move);

		return this;

	};

	TimeBar.getSelectedTime = function() {

		// How many hours have been scrolled horizontally?
		var hoursScrolledLeft = window.pageXOffset / g.HOUR_WIDTH,
			// Calculate the left border time, and right border time
			leftBorderTime = new Date(g.ZERO.valueOf() + (hoursScrolledLeft * g.MILLISECONDS_IN_HOUR)),
			rightBorderTime = new Date(g.ZERO.valueOf() + (hoursScrolledLeft * g.MILLISECONDS_IN_HOUR) + (g.VIEWPORT_WIDTH_HOURS * g.MILLISECONDS_IN_HOUR));

		return {
			startTime: leftBorderTime,
			endTime: rightBorderTime
		};

	};

	TimeBar.move = function(event) {

		$timelist.css({ 'left': window.pageXOffset * -1 });

	};

	return TimeBar;

});