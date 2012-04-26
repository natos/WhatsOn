define([

	'components/grid',
	'components/search'

], function(Grid, Search) {

	/* global signature */
	window.upc = App = {};

	/* constructor */
	App.initialize = function() {

		// cutting the mustard
		this.mustard = ('querySelector' in document && 'localStorage' in window && 'addEventListener' in window);

		// controllers instances
		this.controllers = {};

		// views instances
		this.views = {};

		// setup components
		this.components = {
			grid: Grid.initialize(),
			search: Search.initialize()
		};

		// start navigation
		navigation();

		return this;

	};

	/* private */

	// auto select the navigation menu
	var navigation = function() {

		var nav = $('.nav'),
			path = window.location.pathname;

		if (path === "/") {
			$('.home').addClass('active'); 
			return; 
		}

		nav.find('a').each(function(index, item) {
			if (this.href.toString().indexOf(path)>-1) { 
				$(this).addClass('active'); 
				return; 
			}
		});

	};

	return App;

});