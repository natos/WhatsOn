/*
* HighlightComponent
* -----------------
*/

define([

	'utils/dom'

], function(dom) {

	var name = 'highlight',

/* private */

	CATEGORIES_URL = 'http://tvgids.upc.nl/cgi-bin/WebObjects/EPGApi.woa/api/Subcategory.json',

	_raw = false,
	_categories = {},
	_select;

	function selectChangeHandler(event) {

		var cssText = [],
			// read the selecteed category
			selection = event.target[event.target.selectedIndex].innerHTML,
 			// style element
			style = document.getElementById('highlight-styles');

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

		var name, category, subcategory, i,
			option, optionElement = dom.create('option');

		for (i = 0; i < _raw.length; i++) {
			name = _raw[i].category.name;
			name = name.replace('/','-'); // the '/' is not interperted by CSS

			if (!_categories[name]) {
				_categories[name] = _raw[i].category;
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
		document.getElementsByTagName('head')[0].removeChild(style);

	}

/* public */ 

	function initialize() {

		var i = 0, category, subcategory;

		if (!_raw) {

			$.getJSON(CATEGORIES_URL + '?callback=?', function(data) {
				_raw = data;
				data = null;

				createSelector();
			});
		}

		return this;
	}

	function render() {

		if (!_select) {
			console.log('cant renderyet ')
			return this;
		}

		console.log('rendering');

		var form = document.getElementsByTagName('form')[0];

			form.appendChild(_select);

		console.log('rendered');

		return this;
	}

	function finalize() {

		removeStyles();

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