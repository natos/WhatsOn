/* 
* MenuView
* --------
*
*/

define([
	
	'config/app',
	'lib/flaco/view',
	'modules/event',
	'utils/dom',
	'utils/language'

], function ChannelViewScope(a, View, Event, dom, Language) {

	var name = 'menu';
	var lang = new Language('nl'); // TODO: get correct language code

/* private */

	var _menu = dom.doc.getElementsByTagName('nav')[0];

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

	function localize() {
		var settingsLabel = document.getElementById("menu-item-settings-label");
		var settingsLabelText = lang.translate('nav-label-settings');
		dom.empty(settingsLabel);
		settingsLabel.appendChild(document.createTextNode(settingsLabelText));
		settingsLabel.parentNode.title = settingsLabelText;

		settingsLabel = document.getElementById("menu-item-user-settings-label");
		dom.empty(settingsLabel);
		settingsLabel.appendChild(document.createTextNode(settingsLabelText));
		settingsLabel.parentNode.title = settingsLabelText;

		var searchLabel = document.getElementById("menu-item-search-label");
		var searchLabelText = lang.translate('nav-label-search');
		dom.empty(searchLabel);
		searchLabel.appendChild(document.createTextNode(searchLabelText));
		searchLabel.parentNode.title = searchLabelText;
	}

/* public */

	function initialize(State) {

		// Listen for action
		Event.on(a.ACTION, handleActions);

		return this;

	}

	function render() {

		localize();

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