/*
* OverlayComponent
* ----------------
* @class Overlay
*/

define([

	'modules/app',
	'modules/router',
	'utils/dom',
	'utils/language'

], function OverlayComponentScope(App, Router, dom, Language) {

	var name = 'overlay';

/* private */

	var lang,
	// UI elements
		_box,
		_content,
		_close;

	function closeHandler(event) {
		event.preventDefault();
		close();
	}

	function keyupHandler(event) {
		var which = event.keyCode || event.charCode;
		if (which===27) {
			close();
		}
	}

	function close() {
		hide();
		// use the history to go back
		// instead of removing overlay view
		// Router.back();
	}

/* public */

	function content() {
		return _content;
	}

	function show(html) {
		_content.innerHTML = html || '<div class="loading">' + lang.translate('loading') + '</div>';
		_box.className = 'active';
	}

	function hide() {
		_content.innerHTML = '';
		_box.className = '';
	}

	function initialize() {

console.log('init overlay');
		lang = new Language(App.selectedLanguageCode);

		_box 	= dom.element('div', { id: name }),
		_content = dom.element('div', { id: 'overlay-content' }),
		_close 	= dom.element('a', { id: 'overlay-close', href: '#overlay-close' });

		var _lbl, _icon;
		// create the label
		_lbl = dom.element('b', { class: 'label' });
		_lbl.innerHTML = lang.translate('close');
		// create the icon
		_icon = dom.element('i', { class: 'icon-remove-sign' });
		// create close button
		_close.appendChild(_icon);
		_close.appendChild(_lbl);
		// create the layout
		_box.appendChild(_content);
		_box.appendChild(_close);

		return this;
	}

	function render() {

		_close.addEventListener('click', closeHandler);

		window.addEventListener('keyup', keyupHandler);

		document.body.appendChild(_box);

		return this;

	}

	function finalize() {

		_close.removeEventListener('click', closeHandler);

		window.removeEventListener('keyup', keyupHandler);

		while (_box.firstChild) { _box.removeChild(_box.firstChild); }

		document.body.removeChild(_box);

		_box = null;
		_content = null;
		_close = null;

		return this;

	}

/* export */ 

	return {
		name		: name,
		initialize	: initialize,
		finalize	: finalize,
		render		: render,
		show		: show,
		hide		: hide,
		content 	: content // DOM interface
	};

});