/*
* TimeBar
* -------
*/

define([

	'config/app',
	'config/grid',
	'config/channel',
	'modules/app',
	'models/channel',
	'utils/convert',
	'utils/dom'

], function TimeBarComponentScope(a, g, c, App, ChannelModel, convert, dom) {

	var name = 'timebar',

/* private */

	_content = document.getElementById('main'),
	_template = document.getElementById('timebar-template'),
	_timebar = dom.create('div'),
	_timelist,
	_timecontrols = dom.create('div'),
	_timecontrolsTemplate = document.getElementById('timecontrols-template');

	_timecontrols.id = 'time-controls';
	_timecontrols.innerHTML = _timecontrolsTemplate.innerHTML;

	function centerViewPort() {

		var left = convert.timeToPixels( (new Date()).valueOf() );

		left = left - ( a._doc.body.clientWidth / 2 ) + g.CHANNEL_BAR_WIDTH;

		// move the window left, but the same distance top
		a._win.scroll(left, a._doc.body.scrollTop);

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
				if (!ChannelModel[c.GROUPS][event.target.value]) {
					console.log('The selected groun doesn\'t exist');
					return;
				}
				ChannelModel.set(c.SELECTED_GROUP, event.target.value);
				break;

			case 'timeSelector':
				console.log(event.target.id);
				centerViewPort();
				break;
		}
	}

	function toggleTimeControls() {
		_timebar.className = (_timebar.className === '') ? 'expanded' : '';
	}

	function handleActions(action) {
		if (action === 'TOGGLE-EDIT-MODE') {
			toggleTimeControls();
		}
	}

/* public */

	function initialize() {

		// add logo behavior, move to 'now'
		$('.upc-logo').on('click', centerViewPort);

		// move with the grid
		App.on(g.MODEL_CHANGED, modelChanged);

		App.on(a.ACTION, handleActions);

		return this;

	}

	function render() {

		// expand time bar
		_timebar.innerHTML = _template.innerHTML;
		_timebar.id = "time-bar";
		_timebar.appendChild(_timecontrols);
		//_timebar.addEventListener('click', toggleTimeControls);
		_timecontrols.addEventListener('change', changeChannelSelection);

		// Render the time intervals
		var zeroTime = g.zeroTime,
			timeIntervalsHtml = "",
			daysOfWeek = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'],
			t;

		for (var i=0; i<24; i++) {
			t = new Date(zeroTime.valueOf() + (i * 60 * 60 * 1000));
			// All the grid date/time/position calculations are done in UTC.
			// To adjust the display for the user's actual time zone, all we
			// have to do is show the USER LOCAL time version of the UTC datetime
			// in the timebar.
			timeIntervalsHtml += "<li><span>" + ("0" + t.getHours()).slice(-2) + ":00</span></li>"; //":00 (" + daysOfWeek[t.getDay()] + ")</span></li>";
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

		App.off(a.ACTION, handleActions);

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