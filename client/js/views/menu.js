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
		var translationsMap = [
			{ids:['menu-label-home'], key:'home'},
			{ids:['menu-label-search'], key:'search'},
			{ids:['menu-label-tvguide'], key:'tvguide'},
			{ids:['menu-label-nownext'], key:'nownext'},
			{ids:['menu-label-settings','menu-label-user-settings'], key:'settings'},
			{ids:['menu-label-login'], key:'login'},
			{ids:['menu-label-user-logout'], key:'logout'}
		];

		var translationsMapItem, i, j, ids, el, translationValue;

		i = translationsMap.length;
		while (i--) {
			translationsMapItem = translationsMap[i];
			ids = translationsMapItem.ids;
			translationValue = lang.translate(translationsMapItem['key']);

			j = ids.length;
			while (j--) {
				el = document.getElementById(ids[j]);
				if (el) {
					dom.empty(el);
					el.appendChild(document.createTextNode(translationValue));
					if (el.parentNode) {
						el.parentNode.title = translationValue;
					}
				}
			}
		}
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