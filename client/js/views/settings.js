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
	'lib/flaco/view',
	'utils/dom',
	'components/carousel'

], function SettingsView(a, AppModel, App, Event, View, dom, Carousel) {

	var name = 'settings',

/* private */

	selectedCountry,

	content = dom.element('div', { id: name + '-content' });

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

		var checks = content.querySelectorAll('input:checked');

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

		var i, t, article, countries, country, title, subtitle, list, li, label, selected;

		article = dom.element('article');

		subtitle = dom.element('h2');
		subtitle.innerHTML = "Select your country";

		list = dom.element('ul');

		article.appendChild(subtitle);
		article.appendChild(list);

		countries = AppModel[a.COUNTRIES_CACHE].data;

		for (i = 0, t = countries.length; i < t; i++) {
			country = countries[i].name;
			selected = country === selectedCountry;
			inputAttr = {
				type: 'radio', 
				name: 'country-selector', 
				value: country
			}
			if (country === selectedCountry) { inputAttr.checked = 'checked'; }
			label = dom.element('label');
			label.appendChild(dom.element('input', inputAttr));
			label.appendChild(dom.doc.createTextNode(country));
			li = dom.element('li');
			li.appendChild(label);
			list.appendChild(li);
		}

		article.appendChild(button);

		template.appendChild(article);

		return template;

	}

/* public */

	function initialize() {

		selectedCountry = AppModel[a.SELECTED_COUNTRY];

		dom.content.appendChild(content);

		return this;

	}

	function render() {

		if (AppModel[a.COUNTRIES_CACHE]) {

			dom.empty(content);

			content.appendChild(createLayout());

			content.addEventListener('change', handleChange);

			button.addEventListener('click', handleSelection);

		} else {

			content.appendChild(dom.text('Loading...'));

		}

		return this;

	}

	function finalize() {

		dom.empty(content);

		dom.content.removeChild(content);

		content.removeEventListener('change', handleChange);

		button.removeEventListener('click', handleSelection);

		return this;

	}


/* export */

	return new View({
		name				: name,
		initialize			: initialize,
		finalize			: finalize,
		render				: render
	});

});