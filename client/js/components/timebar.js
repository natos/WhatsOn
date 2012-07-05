/*
* TimeBar
* -------
*/

define([

	'config/grid', 
	'modules/app',
	'utils/convert'

], function TimeBar(g, App, convert) {

	var name = 'timebar';

/* private */

	var	$timelist,

	timer = {
		clock	: void 0,
		time	: 1000 * 5, // time to tick
		status	: false,
		element	: $('<div class="timer-ticker">'),
		start	: timer_start,
		tick	: timer_run,
		restart	: timer_restart,
		stop	: timer_stop
	};

	/* timer functions */
	function timer_start() {
		timer.status = true;
		timer.element.appendTo('#grid-content');
		timer.clock = setTimeout(timer.tick, timer.time);
		return this;
	}

	function timer_run() {
		if (!timer.status) { return; }
		timer.element.css('left', convert.timeToPixels( new Date() ));
		timer.restart();
		return this;
	}

	function timer_restart() {
		timer.stop();
		timer.start();
		return this;
	}

	function timer_stop() {
		timer.status = false;
		timer.clock = clearTimeout(timer.clock);
		return this;
	}

	function centerViewPort() {

		var left = convert.timeToPixels( new Date() );

		// center in the screen
		left = left - ( document.body.clientWidth / 2 ) + g.CHANNEL_BAR_WIDTH;

		// move the window left, but the same distance top
		window.scroll(left, document.body.scrollTop);

		return this;

	}

	function move(position) {
		if ($timelist) {
			$timelist.css({ left: position.left + 'px' });
		}
	}

	/* modelchange */
	function modelChanged(changes) {
		if (typeof changes === 'undefined') { return; }
		// if there changes on the position object, move the bar
		if (changes.position) {
			move(changes.position);
		}
	}


/* public */

	function initialize() {

		// add logo behavior, move to 'now'
		$('.upc-logo').on('click', centerViewPort);

		// move with the grid
		App.on(g.MODEL_CHANGED, modelChanged);

		return this;

	}

	function render() {

		$timelist = $('#time-bar-list', '#content');

		// Render the time intervals
		var zeroTime = g.zeroTime;
		var timeIntervalsHtml = "";
		var daysOfWeek = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'];
		var t;
		for (var i=0; i<24; i++) {
			t = new Date(zeroTime.valueOf() + (i * 60 * 60 * 1000));
			timeIntervalsHtml += "<li><span>" + ("0" + t.getHours()).slice(-2) + ":00 (" + daysOfWeek[t.getDay()] + ")</span></li>";
		}
		$timelist.html(timeIntervalsHtml);

		// initialize ticker
		timer.start().tick();

		// scroll to now
		centerViewPort();

		return this;

	}

	function finalize() {

		$('.upc-logo').off('click', centerViewPort);

		App.off(g.MODEL_CHANGED, modelChanged);

		// stop ticking timer
		timer.stop();

		return this;
	}

/* export */

	return {
		name		: name,
		initialize	: initialize,
		finalize	: finalize,
		render		: render,
		centerViewPort : centerViewPort
	};

});