/* 
* SettingsView
* --------------
*
* Controlls settings page
*
*/

define([

	'config/app',
	'models/app',
	'modules/app',
	'modules/event',
	'components/overlay',
	'lib/flaco/view',
	'utils/dom'

], function SettingsView(a, AppModel, App, Event, Overlay, View, dom) {

	var name = 'settings',

/* private */

	template = dom.element('fragment'),

	button = dom.element('input', { type: 'submit', value: 'Continue', disabled:'disabled' });


	/* Handle data changes */
	Event.on(a.MODEL_CHANGED, function(changes) {

		// Once we got countries information
		if (changes[a.COUNTRIES_CACHE]) {
			render();
		}

	});

	function handleSelection(event) {

		var checks = Overlay.content.querySelectorAll('input:checked');

		if (checks.length > 0) {
			Event.emit(a.SELECTED_COUNTRY, checks[0].value);
		} else {
			console.log('need to select a country man')
		}
	}

	// enable the button
	function handleChange(event) {
		button.removeAttribute('disabled');
	}

	function createLayout() {

		var i, t, countries, country, title, subtitle, list, li, label;

		title = dom.element('h1');
		title.innerHTML = "Settings";

		subtitle = dom.element('h2');
		subtitle.innerHTML = "Select your country";

		list = dom.element('ul');

		template.appendChild(title);
		template.appendChild(subtitle);
		template.appendChild(list);

		countries = AppModel[a.COUNTRIES_CACHE].data;

		for (i = 0, t = countries.length; i < t; i++) {
			country = countries[i].name;
			label = dom.element('label');
			label.appendChild(dom.element('input', { type: 'radio', name: 'country-selector', value: country }));
			label.appendChild(dom.doc.createTextNode(country));
			li = dom.element('li');
			li.appendChild(label);
			list.appendChild(li);
		}

		template.appendChild(button);

		return template;

	}

/* public */

	function initialize() {

		return this;

	}

	function render() {

		if (AppModel[a.COUNTRIES_CACHE]) {

			Overlay.content.appendChild(createLayout());

			Overlay.show();

			Overlay.content.addEventListener('change', handleChange);

			button.addEventListener('click', handleSelection);

		} else {

			Overlay.show('Loading...');

		}

		return this;

	}

	function finalize() {

		Overlay.content.removeEventListener('change', handleChange);

		button.removeEventListener('click', handleSelection);

		return this;

	}


/* export */

	return new View({
		name				: name,
		initialize			: initialize,
		finalize			: finalize,
		render				: render,
		components			: {
			overlay	: Overlay
		}
	});

});