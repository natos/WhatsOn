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

	_content = document.getElementById('content'),
	_template = document.getElementById('timebar-template'),
	_timebar = document.createElement('div'),
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

		switch(event.target.name) {
			case 'channelSelector':
				// change channel selection 
				ChannelModel.set(c.SELECTED_GROUP, event.target.value);
				break;

			case 'timeSelector':
				console.log(event.target.id);
				centerViewPort();
				break;
		}
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
		_timebar.innerHTML = _template.innerHTML;
		_timebar.id = "time-bar";
		_timebar.appendChild(_timecontrols);
		_timebar.addEventListener('click', toggleTimeControls);
		_timecontrols.addEventListener('change', changeChannelSelection);

		// Render the time intervals
		var zeroTime = g.zeroTime,
			timeIntervalsHtml = "",
			daysOfWeek = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'],
			t;

		for (var i=0; i<24; i++) {
			t = new Date(zeroTime.valueOf() + (i * 60 * 60 * 1000));
			timeIntervalsHtml += "<li><span>" + ("0" + t.getHours()).slice(-2) + "hs</span></li>"; //":00 (" + daysOfWeek[t.getDay()] + ")</span></li>";
		}

		
		_content.appendChild(_timebar);
		_timelist = document.getElementById('time-bar-list');
		_timelist.innerHTML = timeIntervalsHtml;

		// scroll to now
		centerViewPort();

		return this;

	}

	function finalize() {

		$('.upc-logo').off('click', centerViewPort);

		App.off(g.MODEL_CHANGED, modelChanged);

		_content.removeChild(_timebar);

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