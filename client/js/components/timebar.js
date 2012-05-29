/*
* TimeBar
* -------
* @class TimeBar
*/

define([

	'config/grid', 
	'utils/convert'

], function TimeBar(g, convert) {

	var	$timelist;

	/**
	 * Load the content for the component
	 * Set up event handlers.
	 * @public
	 */
	function initialize() {

		$timelist = $('#time-bar').find('ol');

		// move with the grid
		upc.on(g.MODEL_CHANGED, modelChanged);

		// add logo behavior, move to 'now'
		$('.upc-logo').on('click', centerTimebar);

		// initialize ticker
		ticker();
			
		// scroll to now
		centerTimebar();

		return this;

	};

	/**
	 * If necessary, remove the content for the component from the DOM.
	 * Clean up event handlers.
	 * @public
	 */
	function finalize() {
		upc.off(g.MODEL_CHANGED, modelChanged);
		$('.upc-logo').off('click', centerTimebar);
	};

	/**
	 * Handler for model data changes.
	 * @private
	 */
	function modelChanged(obj) {
		if (obj.position) {
			$timelist.css({ left: obj.position.left });
		}
	};

	/**
	 * Scroll to get the timebar in the middle of the screen.
	 * @private
	 */
	function centerTimebar() {
		var left = convert.timeToPixels( new Date() );

		// center in the screen
		left = left - ( document.body.clientWidth / 2 ) + g.CHANNEL_BAR_WIDTH;

		// move the window left, but the same distance top
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
		tick(); 

		element.appendTo('#grid-container');
	};


	/* public */
	return {
		initialize: initialize,
		finalize: finalize,
		ticker: ticker
	};

});