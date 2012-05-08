define([

	'config/app',
	'controllers/app',
	'components/carousel'

], function DashboardView(c, App, Carousel) {

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

		upc.emit(c.VIEW_LOADED, this);
		
		return this;

	};

	return Dashboard;

});