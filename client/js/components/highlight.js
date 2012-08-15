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

		var selection = event.target[event.target.selectedIndex].innerHTML;
 		
 		// style element
 		var style = document.getElementById('highlight-styles');
 		
		if (!style) {
			style = dom.create('style');
			style.id = 'highlight-styles';
			document.getElementsByTagName('HEAD')[0].appendChild(style);
		}

		var cssText = [];
			// Generate style rules for the heights and widths specific to the current browser
			cssText.push('#grid-container a[data-category='+selection+'] { background-color: yellow; }'); // Hack the .nav z-index for the grid

		// insert styles
		// redraw and reflow here!
		style.innerHTML = cssText.join('\n');
	}

	function createSelector() {

			_select = dom.create('select');
			_select.addEventListener('change', selectChangeHandler);

		var category, subcategory, i,
			option, optionElement = dom.create('option');

		for (i = 0; i < _raw.length; i++) {

			if (!_categories[_raw[i].category.name]) {
				_categories[_raw[i].category.name] = _raw[i].category;
			}
		}

		for (category in _categories) {
			console.log(category);
			option = optionElement.cloneNode(false);
			option.innerHTML = category;
			_select.appendChild(option);
		}

		render();

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