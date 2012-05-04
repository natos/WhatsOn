define([

	'/assets/js/lib/event/event.js',
	'controllers/user',
	'components/user',
	'components/grid',
	'components/search'

], function(EventEmitter, UserController, User, Grid, Search) {

	/* global signature */
	window.upc = App = new EventEmitter();

	/* constructor */
	App.initialize = function() {

		// cutting the mustard
		this.mustard = ('querySelector' in document && 'localStorage' in window && 'addEventListener' in window);

		// controllers instances
		this.controllers = {
			user: UserController.initialize()
		};

		// views instances
		this.views = {};

		// setup components
		this.components = {
			grid: Grid.initialize(),
			search: Search.initialize(),
			user: User.initialize()
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