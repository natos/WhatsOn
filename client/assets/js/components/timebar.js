define([

], function(Grid) {

/* private */

var	$body = $(document.body),

	$timebar = $('#time-bar'),

	$timelist = $timebar.find('ol'),

/* @class TimeBar */
	TimeBar = {};

	/* constructor */
	TimeBar.initialize = function() {

		$body.on('grid:moved', this.move);

		return this;

	};

	TimeBar.move = function(event) {

		$timelist.css({ 'left': window.pageXOffset * -1 });

	};

	return TimeBar;

});