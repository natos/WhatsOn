/* 
* MenuView
* --------
*
*/

define([
	
	'config/app',
	'lib/flaco/view',
	'modules/event',
	'utils/dom'

], function ChannelViewScope(a, View, Event, dom) {

	var name = 'menu',

/* private */

	_menu = dom.doc.getElementsByTagName('nav')[0];

	function handleActions(action, dataset) {
		switch (action) {
			case 'TOGGLE-MENU': 
				toggleMenu(); break;
		}
	}

	function toggleMenu() {
		if (/open/.test(dom.main.className)) {
			close();
		} else {
			open();
		}
	}

/* public */

	function initialize(State) {

		// Listen for action
		Event.on(a.ACTION, handleActions);

		return this;

	}

	function render() {



		return this;

	}

	function finalize() {

		Event.off(a.ACTION, handleActions);

		return this;

	}

	function open() {
		dom.main.className = 'open';
		_menu.className = 'nav active';
	}

	function close() {
		dom.main.className = '';
		_menu.className = 'nav';
	}

/* export */

	return new View({
		name		: name,
		initialize	: initialize,
		finalize	: finalize,
		close 		: close,
		open 		: open,
		render		: render
	});

});