/*
* TimeBar
* -------
*/

define([

	'config/grid',
	'config/channel',
	'modules/app',
	'models/channel',
	'utils/convert'

], function TimeBar(g, c, App, ChannelModel, convert) {

	var name = 'timebar',

/* private */

	_timebar,
	_timelist,
	_timecontrols = document.createElement('div'),
	_timecontrolsTemplate = document.getElementById('timecontrols-template');

	_timecontrols.id = 'time-controls';
	_timecontrols.innerHTML = _timecontrolsTemplate.innerHTML;

	function centerViewPort() {

		var left = convert.timeToPixels( new Date() );
			left = left - ( document.body.clientWidth / 2 ) + g.CHANNEL_BAR_WIDTH;

		// move the window left, but the same distance top
		window.scroll(left, document.body.scrollTop);

		return this;

	}

	function move(position) {
		if (_timelist) {
			_timelist.style.left = position.left + 'px';
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

	function changeChannelSelection(event) {
		// change channel selection 
		ChannelModel.set(c.SELECTED_GROUP, event.target.value);
	}

	function toggleTimeControls(event) {

		event.stopPropagation();

		var target = event.target;

		while (target.id === 'time-controls') {
			target = target.parentNode;
		}

		// close time controls
		if (_timebar.className) {
			_timebar.className = '';
			return;
		}

		_timebar.className = 'expanded';

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

		// expand time bar
		_timebar = document.getElementById('time-bar');
		_timebar.appendChild(_timecontrols);
		_timebar.addEventListener('click', toggleTimeControls);
		_timecontrols.addEventListener('change', changeChannelSelection);

		_timelist = document.getElementById('time-bar-list');

		// Render the time intervals
		var zeroTime = g.zeroTime,
			timeIntervalsHtml = "",
			daysOfWeek = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'],
			t;

		for (var i=0; i<24; i++) {
			t = new Date(zeroTime.valueOf() + (i * 60 * 60 * 1000));
			timeIntervalsHtml += "<li><span>" + ("0" + t.getHours()).slice(-2) + "hs</span></li>"; //":00 (" + daysOfWeek[t.getDay()] + ")</span></li>";
		}

		_timelist.innerHTML = timeIntervalsHtml;

		// scroll to now
		centerViewPort();

		return this;

	}

	function finalize() {

		$('.upc-logo').off('click', centerViewPort);

		App.off(g.MODEL_CHANGED, modelChanged);

		return this;
	}

/* export */

	return {
		name			: name,
		initialize		: initialize,
		finalize		: finalize,
		render			: render,
		centerViewPort	: centerViewPort
	};

});