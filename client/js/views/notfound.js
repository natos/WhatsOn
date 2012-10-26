/* 
* 404View
* -------
*
*/

define([

	'lib/flaco/view',
	'utils/dom'

], function ProgrammeViewScope(View, dom) {

	var name = 'notfound',

/* private */

	_template;

/* public */

	function initialize(State) {

		return this;

	}

	function render() {

		var title, message, recovery;

		title = dom.element('h1');
		title.appendChild(dom.text('404: Not found'));

		message = dom.element('p');
		message.appendChild(dom.text('Sorry! We couldn\'t find what you ask for.'))

		recovery = dom.element('button');
		recovery.appendChild(dom.text('Check What\'s TV!'));

		_template = dom.element('section', { class: 'not-found' });
		_template.appendChild(title);
		_template.appendChild(message);
		_template.appendChild(recovery);

		dom.content.appendChild(_template);

		return this;

	}

	function finalize() {

		_template.parentNode.removeChild(_template);

		return this;

	}

/* export */
	
	return new View({
		name		: name,
		initialize	: initialize,
		finalize	: finalize,
		render		: render
	});

});