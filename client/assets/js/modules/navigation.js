/* 
* NavigationModule
* ----------------
* This module is responsible for dealing with the navigation bar at the top of the page.
* When a client-side navigation event occurs, the correct icon should be made active.
*/

define([

	'config/app',
	'modules/app',
	'components/grid',
	'components/search',
	'views/navigation'

], function NavigationModule(c, App, Grid, Search, NavigationView) {

/* private */

	/* constructor */
	function initialize() {

		// start navigation
		navigation();

		$('.navbar').find('a').each(function() {
			var appUrl = this.getAttribute('data-appurl');
			if (appUrl) {
				this.href = appUrl;
			}
		});

		return this;

	};

	// auto select the navigation menu
	function navigation() {
	
		var nav = $('.nav'), path = window.location.pathname;
	
		if (path === "/") { $('.home').addClass('active'); return; }
	
		nav.find('a').each(function(index, item) {
			if (this.href.toString().indexOf(path)>-1) { 
				$(this).addClass('active'); 
				return; 
			}
		});	
	};

/* public */
	return {
		name: 'navigation',
		initialize: initialize,
		view: NavigationView.initialize(),
		components: {
			grid: Grid.initialize(),
			search: Search.initialize()
		}
	};

});