/* 
* DashboardView
* -------------
*
*/

define([

	'modules/app',
	'lib/flaco/view',
	'components/carousel',
	'components/favorites'

], function DashboardView(App, View, Carousel, Favorites) {

	var name = "dashboard";

/* private */


/* public */


/* abstract */ 

	function initialize() {

		return this;

	};

	function render() {

		return this;

	};

	function finalize() {

		return this;

	};

/* export */

	return new View({
		name: name,
		render: render,
		finalize: finalize,
		initialize: initialize,
		components: {
			carousel: Carousel,
			favorites: Favorites
		}
	});

});