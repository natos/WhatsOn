define([

	'config/grid',
	'utils/convert'

], function(g, convert) {

/* private */
function modelChanged(obj) {
	if (obj.position) {
		$timelist.css({ left: obj.position.left });
	}
};

var	$timelist = g.$timebar.find('ol'),

/* @class TimeBar */
	TimeBar = {};
	
	/* constructor */
	TimeBar.initialize = function() {

		// move with the grid
		upc.on(g.MODEL_CHANGED, modelChanged);

		// add logo behavior, move to 'now'
		$('.upc-logo').click(function(event){ TimeBar.goTo('now'); });

		// initialize ticker
		this.ticker();
			
		// scroll to now
		this.goTo();

		return this;

	};

	TimeBar.goTo = function(data) {

		// TODO: Evaluate 'data' to move to other times

		var left = convert.timeToPixels( new Date() );
			// center in the screen
			left = left - ( document.body.clientWidth / 2 ) + g.CHANNEL_BAR_WIDTH;

			// move the window left, 
			// but the same distance top
			window.scroll(left, document.body.scrollTop);

		return this;

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

	return TimeBar;

});