define([

	'controllers/app',
	'components/carousel'

], function(App, Carousel) {

/* @class Dashboard */
var Dashboard = {};

	/* constructor */
	Dashboard.initialize = function() {

		// Let the App know your here
		App.views.dashboard = this;

		// configure and run components
		this.components = {
			carousel: Carousel.initialize('#featured') // dom query to select the carousel
		};
		
		return this;

	};

	return Dashboard;

});