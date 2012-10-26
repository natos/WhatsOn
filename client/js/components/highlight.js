/*
* HighlightComponent
* -----------------
*/

define([

	'config/app',
	'models/app',
	'modules/event',
	'utils/dom'

], function(a, AppModel, Event, dom) {

	var name = 'highlight',

/* private */

	_raw = false,
	_categories = {},
	_form,
	_select;

	function selectChangeHandler(event) {

		var cssText = [],
			// read the selecteed category
			selection = event.target[event.target.selectedIndex].innerHTML,
 			// style element
			style = document.getElementById('highlight-styles');

		// if selection is no selection
		// remove styles
		if (selection === 'highlight') {
			removeStyles();
		}

		if (!style) {
			style = dom.create('style');
			style.id = 'highlight-styles';
			document.getElementsByTagName('HEAD')[0].appendChild(style);
		}

		// Generate style rules for the heights and widths specific to the current browser
		cssText.push('#grid-container .grid-event[data-category='+selection+'] {');
		cssText.push('\tbackground: rgb(230,240,163);');
		cssText.push('\tbackground: -moz-linear-gradient(top,  rgba(230,240,163,1) 0%, rgba(210,230,56,1) 50%, rgba(195,216,37,1) 51%, rgba(219,240,67,1) 100%);');
		cssText.push('\tbackground: -webkit-gradient(linear, left top, left bottom, color-stop(0%,rgba(230,240,163,1)), color-stop(50%,rgba(210,230,56,1)), color-stop(51%,rgba(195,216,37,1)), color-stop(100%,rgba(219,240,67,1)));');
		cssText.push('\tbackground: -webkit-linear-gradient(top,  rgba(230,240,163,1) 0%,rgba(210,230,56,1) 50%,rgba(195,216,37,1) 51%,rgba(219,240,67,1) 100%);');
		cssText.push('\tbackground: -o-linear-gradient(top,  rgba(230,240,163,1) 0%,rgba(210,230,56,1) 50%,rgba(195,216,37,1) 51%,rgba(219,240,67,1) 100%);');
		cssText.push('\tbackground: -ms-linear-gradient(top,  rgba(230,240,163,1) 0%,rgba(210,230,56,1) 50%,rgba(195,216,37,1) 51%,rgba(219,240,67,1) 100%);');
		cssText.push('\tbackground: linear-gradient(to bottom,  rgba(230,240,163,1) 0%,rgba(210,230,56,1) 50%,rgba(195,216,37,1) 51%,rgba(219,240,67,1) 100%);');
		cssText.push('\tfilter: progid:DXImageTransform.Microsoft.gradient( startColorstr=\'#e6f0a3\', endColorstr=\'#dbf043\',GradientType=0 );');
		cssText.push('\tborder-top: 1px solid yellowGreen;');
		cssText.push('\tbox-shadow: inset 0px 0px 10px yellowGreen;');
		cssText.push('}');
		cssText.push('#grid-container .grid-event[data-category='+selection+'].tiny:after {');
		cssText.push('\tcolor: yellowgreen');
		cssText.push('}');

		// insert styles
		// redraw and reflow here!
		style.innerHTML = cssText.join('\n');
	}

	function createSelector() {

			_select = dom.create('select');
			_select.addEventListener('change', selectChangeHandler);

		// add the first option (not-selectable)
		_categories['highlight'] = 'highlight';

		var name, category, subcategory, i,
			option, optionElement = dom.create('option');

		for (i = 0, t = _raw.data.length; i < t; i++) {
			name = _raw.data[i].name;
			name = name.replace('/','-'); // the '/' is not interperted by CSS

			if (!_categories[name]) {
				_categories[name] = _raw.data[i].name;
			}
		}

		for (category in _categories) {
			option = optionElement.cloneNode(false);
			option.innerHTML = category;
			_select.appendChild(option);
		}

		render();

	}


	function removeStyles() {

		var style = document.getElementById('highlight-styles');

		if (style) {
			style.parentNode.removeChild(style);
		}

	}

/* public */ 

	function initialize() {

		var i = 0, category, subcategory;

		if (!AppModel[a.CATEGORIES_CACHE]) {

				Event.on(a.MODEL_CHANGED, function(changes) {
					if (changes[a.CATEGORIES_CACHE]) {
						_raw = changes[a.CATEGORIES_CACHE];
						createSelector();
					}
				});

		} else {

			_raw = AppModel[a.CATEGORIES_CACHE];

			createSelector();

		}

		return this;
	}

	function render() {

		if (!_select) {
			return this;
		}

		form = document.getElementsByTagName('form')[0];

		if (form) {
			form.appendChild(_select);
		}

		return this;
	}

	function finalize() {

		// do I really  want to remove styles?
		// or remember the selection...
		// 'remove or not to remove...'
		//removeStyles();

		return this;

	}

/* export */ 

	return {
		name		: name,
		initialize	: initialize,
		finalize	: finalize,
		render		: render
	};

});