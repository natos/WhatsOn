define([

	'config/grid',
	'utils/convert'

], function(g, convert) {

/* private */

var	$timelist = g.$timebar.find('ol'),

/* @class TimeBar */
	TimeBar = {};
	
	/* constructor */
	TimeBar.initialize = function() {

		// move with the grid
		g.$body.on(g.GRID_MOVED, this.move);

		// initialize ticker
		this.ticker();
			
		// scroll to now
		this.goTo('now');

		return this;

	};

	TimeBar.goTo = function(data) {

		// TODO: Evaluate 'data' to move to other times

		var left = convert.timeToPixels( new Date() );
			// center in the screen
			left = left - ( document.body.clientWidth / 2 ) + g.CHANNEL_BAR_WIDTH;

			// move the window
			window.scroll(left, 0);
			// move the timebar
			TimeBar.move();

		return this;

	};

	TimeBar.getSelectedTime = function() {

		// How many hours have been scrolled horizontally?
		var hoursScrolledLeft = window.pageXOffset / g.HOUR_WIDTH,
			// Calculate the left border time, and right border time
			leftBorderTime = new Date(g.ZERO.valueOf() + (hoursScrolledLeft * g.MILLISECONDS_IN_HOUR) - (g.VIEWPORT_WIDTH_HOURS/4 * g.MILLISECONDS_IN_HOUR)),
			rightBorderTime = new Date(g.ZERO.valueOf() + (hoursScrolledLeft * g.MILLISECONDS_IN_HOUR) + (g.VIEWPORT_WIDTH_HOURS * g.MILLISECONDS_IN_HOUR));

		return {
			startTime: leftBorderTime,
			endTime: rightBorderTime
		};

	};

	TimeBar.ticker = function() {

		var timer,

		element = $('<div class="timer-ticker">'),

		tick = function() {
			draw();
			timer = setTimeout(function(){ tick() }, 1000 * 5); // update 1x per minute
		},

		draw = function() {

			element.css('left', convert.timeToPixels( new Date() ));

		}

		// first tick
		tick(); element.appendTo(g.$container);
	};

	TimeBar.move = function(event) {

		$timelist.css({ 'left': window.pageXOffset * -1 });

	};

	return TimeBar;

});