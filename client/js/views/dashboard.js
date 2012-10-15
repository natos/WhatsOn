/* 
* DashboardView
* -------------
*
*/

define([

	'modules/app',
	'lib/flaco/view',
	'components/carousel',
	'components/favorites',
	'utils/dom'

], function DashboardView(App, View, Carousel, Favorites, dom) {

	var name = "dashboard";

/* private */


/* public */

	var content = dom.element('div', { id: name + '-content' });

	function initialize() {

		return this;

	}

	function render() {

		dom.content.appendChild(content);

		return this;

	}

	function finalize() {

		dom.content.removeChild(content);

		return this;

	}

/* export */

	return new View({
		name: name,
		render: render,
		finalize: finalize,
		initialize: initialize,
		content: content,
		components: {
			carousel: Carousel,
			favorites: Favorites
		}
	});

});