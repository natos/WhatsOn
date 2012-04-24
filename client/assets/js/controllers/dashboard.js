define([

	'components/carousel'

], function(carousel) {

var Dashboard = {};

	Dashboard.initialize = function() {

		// save this
		window.upc.controllers.dashboard = this;

		// components
		this.components = {};

		// configure and run components
		this.components.carousel = carousel.initialize('#featured'); // dom query to select the carousel
		
		return this;

	};

	return Dashboard;

});