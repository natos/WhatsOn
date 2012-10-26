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

	var name = 'menu',

/* private */

		lang,
		main_nav = dom.doc.getElementById('main-nav'),
		sub_nav = dom.doc.getElementById('sub-nav');

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
			{ids:['menu-label-back'], key:'black', action: setParentNodeTitle},
			{ids:['menu-label-close'], key:'close', action: setParentNodeTitle},
			{ids:['upc-logo', 'pageTitle'], key:'appname'}
		];

		lang.setTextForNamedElements(translationsMap);
	}

/* public */

	// Fancy minimize
	function minimize() {
		// Hide main nav
		main_nav.className = 'nav hide';
		// Add sub nav to the DOM
		dom.main.insertBefore(sub_nav, dom.content);
		// Wait 500 ms
		setTimeout(function() { 
			// Show sub nav
			sub_nav.className = 'nav';
			// remove main nav from DOM
			if (main_nav.parentNode)
				main_nav.parentNode.removeChild(main_nav);
		}, 500);
	}

	// Fancy maximize
	function maximize() {
		// Hide sub nav
		sub_nav.className = 'nav hide';
		// Add main nav to DOM
		dom.main.insertBefore(main_nav, dom.content);
		// Wait 500 ms
		setTimeout(function() { 
			// Show the main nav
			main_nav.className = 'nav';
			// Remove sub nav from DOM
			if (sub_nav.parentNode)
				sub_nav.parentNode.removeChild(sub_nav);
		 }, 500);
	}

	function open() {
		dom.main.className = 'open';
		main_nav.className = 'nav active';
	}

	function close() {
		dom.main.className = '';
		main_nav.className = 'nav';
	}

	function initialize(State) {

		lang = new Language(app.selectedLanguageCode);

		dom.main.removeChild(sub_nav);

		// Listen for action
		Event.on(a.ACTION, handleActions);

		Event.on(a.CONTROLLER_INITIALIZING, close);

		return this;

	}

	function render() {

		localize();

		return this;

	}

	function finalize() {

		Event.off(a.ACTION, handleActions);

		Event.off(a.CONTROLLER_INITIALIZING, close);

		return this;

	}

/* export */

	return new View({
		name		: name,
		initialize	: initialize,
		finalize	: finalize,
		close 		: close,
		open 		: open,
		render		: render,
		minimize	: minimize,
		maximize	: maximize
	});

});