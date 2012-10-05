/*
* TimeBar
* -------
*/

define([

	'config/app',
	'config/grid',
	'config/channel',
	'modules/app',
	'modules/event',
	'models/channel',
	'utils/convert',
	'utils/dom'

], function TimeBarComponentScope(a, g, c, App, Event, ChannelModel, convert, dom) {

	var name = 'timebar',

/* private */

	_template = document.getElementById('timebar-template'),
	_timebar = dom.element('div', { id: 'time-bar' }),
	_timelist,
	_timecontrols = dom.element('div', { id: 'time-controls' }),
	_timecontrolsTemplate = document.getElementById('timecontrols-template');

//	_timecontrols.id = 'time-controls';
//	_timecontrols.innerHTML = _timecontrolsTemplate.innerHTML;

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
		
		var name = event.target.name,
			value = event.target.value;

		switch(name) {
			case 'channelSelector':
				// change channel selection
				if (!ChannelModel[c.GROUPS][value]) {
					console.log('The selected groun doesn\'t exist');
					return;
				}
				ChannelModel.set(c.SELECTED_GROUP, value);
				break;

			case 'timeSelector':
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

		// This just looks ugly now
		// add logo behavior, move to 'now'
		//$('.upc-logo').on('click', centerViewPort);

		// move with the grid
		Event.on(g.MODEL_CHANGED, modelChanged);

		Event.on(a.ACTION, handleActions);

		return this;

	}

	function render() {

		// expand time bar
		// div.shade
		// div.content
		// ol#time-bar-list
		_timebar.appendChild(dom.element('div',{ class: 'shade' }));
		_timebar.appendChild(dom.element('div',{ class: 'content' }));
		_timebar.appendChild(dom.element('ol',{ id: 'time-bar-list' }));

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

		
		dom.main.appendChild(_timebar);
		_timelist = document.getElementById('time-bar-list');
		_timelist.innerHTML = timeIntervalsHtml;

		// scroll to now
		centerViewPort();

		return this;

	}

	function finalize() {

		// This just looks ugly now
		//$('.upc-logo').off('click', centerViewPort);

		Event.off(g.MODEL_CHANGED, modelChanged);

		Event.off(a.ACTION, handleActions);

		dom.main.removeChild(_timebar);

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