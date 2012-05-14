/* 
* DashboardController
* -------------------
*
*/

define([

	'config/app',
	'controllers/app',
	'views/dashboard',
	'components/carousel'

], function DashboardController(c, App, DashboardView, Carousel) {

/* private */
	
	function initialize() {
	
		// Let the App know your here
		App.controllers.dashboard = this;

		// configure and run components
		this.components = {
			carousel: Carousel.initialize('#featured') // dom query to select the carousel
		};
		
		return this;
	
	};

/* public */

/* @class Dashboard */
	return {
		/* constructor */
		initialize: initialize,
		view: DashboardView.initialize()
	};

});