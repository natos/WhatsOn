/*
* OverlayComponent
* ----------------
* @class Overlay
*/

define([

	'modules/app',
	'utils/dom',
	'utils/language'

], function OverlayComponentScope(app, dom, Language) {

	var name = 'overlay';

/* private */

	var lang,
	// UI elements
		_box,
		_content,
		_close;

	function closeHandler(event) {
		event.preventDefault();
		hide();
	}

/* public */ 

	function content() {
		return _content;
	}

	function show(html) {
		if (html) {
			_content.innerHTML = html || '<div class="loading"></div>';
		}
		_box.className = 'active';
	}

	function hide() {
		_content.innerHTML = '';
		_box.className = '';
	}

	function initialize() {

		console.log('init overlay');
		lang = new Language(app.selectedLanguageCode);

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

		document.body.appendChild(_box);

		return this;

	}

	function finalize() {


		_close.removeEventListener('click', closeHandler);

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