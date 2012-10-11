/* 
* DashboardView
* -------------
*
*/

define([

	'modules/app',
	'lib/flaco/view',
	'components/carousel',
	//'components/favorites'

], function DashboardView(App, View, Carousel, Favorites) {

	var name = "dashboard";

/* private */

	//var everyMinuteTimer;

/* public */


/* abstract */ 

	function initialize() {

		// Update the "on-now" section every minute
		//everyMinuteTimer = window.setInterval(function(){
		//	$('#on-now').load('/dashboard #on-now');
//			$('#on-now-by-category').load('/dashboard/on-now-by-category');
		//}, 1000 * 60)


		return this;

	}

	function render() {

		// The "what's on now by category" data is too big for the dashboard (100K+)
//		$('#on-now-by-category').load('/dashboard/on-now-by-category');

		return this;

	}

	function finalize() {

		//window.clearInterval(everyMinuteTimer);

		return this;

	}

/* export */

	return new View({
		name: name,
		render: render,
		finalize: finalize,
		initialize: initialize,
		components: {
			carousel: Carousel
	//		favorites: Favorites
		}
	});

});