define([

	'components/carousel'

], function(carousel) {

var Dashboard = {};

	Dashboard.initialize = function() {

		console.log('Dashboard initialized');

		carousel.initialize();

	};

	return Dashboard;

});