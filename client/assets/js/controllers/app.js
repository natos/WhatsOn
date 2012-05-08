define([

	'/assets/js/lib/event/event.js',
	'config/app',
	'controllers/user',
	'components/user',
	'components/grid',
	'components/search'

], function(EventEmitter, c, UserController, User, Grid, Search) {

	/* global signature */
	window.upc = App = new EventEmitter();

	/* constructor */
	App.initialize = function() {

		// cutting the mustard TODO: move this to main.js, and load zepto for mustard and jquery for mayo
		this.mustard = ('querySelector' in document && 'localStorage' in window && 'addEventListener' in window);

		// setup components
		this.components = {
			grid: Grid.initialize(),
			search: Search.initialize(),
			user: User.initialize()
		};

		// controllers instances
		this.controllers = {
			user: UserController.initialize()
		};

		// views instances
		this.views = {};

		// start navigation
		navigation();

		// global events
		// every view loaded, remove transition
		var transition = $('#transition');
		upc.on(c.VIEW_LOADED, function(event) {
			transition.addClass('hide');
			setTimeout(function() {
				transition.remove();
			}, 500);
		});

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