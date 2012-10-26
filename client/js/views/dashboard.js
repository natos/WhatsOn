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

	var name = "dashboard",

		components = {
			carousel: Carousel,
			favorites: Favorites
		};

/* private */


/* public */

	function initialize() {

		return this;

	}

	function render() {

		return this;

	}

	function finalize() {

		return this;

	}

/* export */

	return new View({
		name: name,
		render: render,
		finalize: finalize,
		initialize: initialize,
		content: content,
		components: components
	});

});