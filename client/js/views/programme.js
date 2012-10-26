/* 
* ProgrammeView
* --------------
*
* Controlls programme page
*
*/
define([
	
	'config/programme',
	'models/programme',
	'views/menu',
	'modules/event',
	'lib/flaco/view',
	'utils/dom',
	'components/social'

], function ProgrammeViewScope(p, ProgrammeModel, Menu, Event, View, dom, Social) {

	var name = 'programme',

		components = { 
			social: Social 
		},

/* private */

		data;

	function handleModelChanged(changes) {
		
		console.log('<PROGRAMME_VIEW>','handleModelChanged', changes)
		
		console.log('p.PROGRAMME', p, p.PROGRAMME)

		if (changes[p.PROGRAMME]) {
			data = changes[p.PROGRAMME].data[0];
			render();
		}

	}

/* public */

	function initialize(State) {

		// listening model changes
		Event.on(p.MODEL_CHANGED, handleModelChanged);

		Menu.minimize();

		return this;

	}

	function render() {

		console.log('<PROGRAMME_VIEW>','RENDERING', this)

		if (!data) {
			return this;
		}

		var title, shortDescription, h1, h2, p, header, section, article, icon, today;


		title = dom.text(data.title);
		shortDescription = dom.text(data.shortDescription);

		h1 = dom.element('h1');
		h1.appendChild(title);

		p = dom.element('p', { class: 'description' });
		p.appendChild(shortDescription);

		header = dom.element('header');
		header.appendChild(h1);
		header.appendChild(p);

		section = dom.element('section');
		article = dom.element('article');
		h2 = dom.element('h2', { class: 'date-title' });
		icon = dom.element('i', { class: 'icon-time' });
		today = dom.text('Today');

		section.appendChild(article);
		section.appendChild(header);

		dom.content.appendChild(section);

		return this;

	}

	function finalize() {

		Event.off(p.MODEL_CHANGED, handleModelChanged);

		Menu.maximize();

		return this;

	}

/* export */
	
	return new View({
		name		: name,
		initialize	: initialize,
		finalize	: finalize,
		render		: render,
		components	: components
	});

});