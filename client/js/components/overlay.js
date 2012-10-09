/*
* OverlayComponent
* ----------------
* @class Overlay
*/

define([

	'utils/dom'

], function OverlayComponentScope(dom) {

	var name = 'overlay',

/* private */

	// UI elements
		box 	= dom.element('div', { id: name }),
		content = dom.element('div', { id: 'overlay-content' }),
		close 	= dom.element('a', { id: 'overlay-close', href: '#overlay-close' });

/* public */ 

	function closeHandler(event) {
		event.preventDefault();
		hide();
	}

	function show(html) {
		if (html) {
			content.innerHTML = html || '<div class="loading"></div>';
		}
		box.className = 'active';
	}

	function hide() {
		content.innerHTML = '';
		box.className = '';
	}

	function initialize() {

		var lbl, icon;
		// create the label
		lbl = dom.element('b', { class: 'label' });
		lbl.innerHTML = 'close';
		// create the icon
		icon = dom.element('i', { class: 'icon-remove-sign' });
		// create close button
		close.appendChild(icon);
		close.appendChild(lbl);
		// create the layout
		box.appendChild(content);
		box.appendChild(close);

		return this;
	}

	function render() {

		close.addEventListener('click', closeHandler);

		document.body.appendChild(box);

		return this;

	}

	function finalize() {

		close.removeEventListener('click', closeHandler);

		while (box.firstChild) { box.removeChild(box.firstChild); }

		document.body.removeChild(box);

		box = null;
		content = null;
		close = null;

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