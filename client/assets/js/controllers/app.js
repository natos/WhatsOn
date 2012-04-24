define([

	'components/search'

], function(Search) {

	/* global signature */
	window.upc = App = {};

	/* constructor */
	App.initialize = function() {

		// controllers instances
		this.controllers = {};

		// components
		this.components = {};

		// setup search component
		this.components.search = Search.initialize();

		// cutting the mustard
		this.mustard = function() {

			if('querySelector' in document
			&& 'localStorage' in window
			&& 'addEventListener' in window) {
				return true;
			}

			return false;
		}();

		// start navigation
		navigation();

	};

	/* private */

	// auto select the navigation menu
	var navigation = function() {

		var nav = $('.nav'),
			path = window.location.pathname;

		if (path === "/") {
			$('.home').addClass('active'); 
			return; 
		};

		nav.find('a').each(function(index, item) {
			if (this.href.toString().indexOf(path)>-1) { 
				$(this).addClass('active'); 
				return; 
			}
		});

	};

	return App;

});