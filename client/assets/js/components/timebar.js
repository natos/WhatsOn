/*
* TimeBar
* -------
* @class TimeBar
*/

define([

	'config/grid', 
	'utils/convert'

], function TimeBar(g, convert) {

/* private */

	var	$timelist = g.$timebar.find('ol');

	/* constructor */
	function initialize() {

		// move with the grid
		upc.on(g.MODEL_CHANGED, modelChanged);

		// add logo behavior, move to 'now'
		$('.upc-logo').click(function(event){ goTo('now'); });

		// initialize ticker
		ticker();
			
		// scroll to now
		goTo();

		return this;

	};

	function modelChanged(obj) {
		if (obj.position) {
			$timelist.css({ left: obj.position.left });
		}
	};

	function goTo(data) {

		// TODO: Evaluate 'data' to move to other times

		var left = convert.timeToPixels( new Date() );
			// center in the screen
			left = left - ( document.body.clientWidth / 2 ) + g.CHANNEL_BAR_WIDTH;

			// move the window left, 
			// but the same distance top
			window.scroll(left, document.body.scrollTop);

		return this;

	};

	function ticker() {

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


/* public */

	return {
		initialize: initialize,
		goTo: goTo,
		ticker: ticker
	};

});