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
		box,
		content,
		close;

/* public */ 

	function closeHandler(event) {
		event.preventDefault();
		hide();
	}

	function show(html) {
		content.innerHTML = html || '<div class="loading"></div>';
		box.className = 'active';
	}

	function hide() {
		content.innerHTML = '';
		box.className = '';
	}

	function initialize() {

		var lbl, icon;
		// create the label
		lbl = dom.create('b');
		lbl.className = 'label';
		lbl.innerHTML = 'close';
		// create the icon
		icon = dom.create('i');
		icon.className = 'icon-remove-sign';
		// create close button
		close = dom.create('a');
		close.id = 'overlay-close';
		close.href = '#overlay-close';
		close.appendChild(icon);
		close.appendChild(lbl);
		// create the container
		content = dom.create('div');
		content.id = 'overlay-content';
		// create the layout
		box = dom.create('div');
		box.id = name;
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
		hide		: hide
	};

});