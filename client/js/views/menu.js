/* 
* MenuView
* --------
*
*/

define([
	
	'config/app',
	'lib/flaco/view',
	'modules/app',
	'modules/event',
	'utils/dom',
	'utils/language'

], function ChannelViewScope(a, View, app, Event, dom, Language) {

	var name = 'menu';

/* private */

	var lang;

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
		var setParentNodeTitle = function(el, translationValue) {
			if (el.parentNode) {
				el.parentNode.title = translationValue;
			}
		};

		var translationsMap = [
			{ids:['menu-label-home'], key:'home', action: setParentNodeTitle},
			{ids:['menu-label-search'], key:'search', action: setParentNodeTitle},
			{ids:['menu-label-tvguide'], key:'tvguide', action: setParentNodeTitle},
			{ids:['menu-label-nownext'], key:'nownext', action: setParentNodeTitle},
			{ids:['menu-label-settings','menu-label-user-settings'], key:'settings', action: setParentNodeTitle},
			{ids:['menu-label-login'], key:'login', action: setParentNodeTitle},
			{ids:['menu-label-user-logout'], key:'logout', action: setParentNodeTitle},
			{ids:['menu-label-menu'], key:'menu', action: setParentNodeTitle},
			{ids:['upc-logo', 'pageTitle'], key:'appname'}
		];

		lang.setTextForNamedElements(translationsMap);
	}

/* public */

	function initialize(State) {

		lang = new Language(app.selectedLanguageCode);

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