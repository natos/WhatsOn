// AppRouter.js

define([

	'views/TopBookingsView',
	'views/AllChannelsView',
	'views/NowAndNextView',
	
	'js/libs/iscroll.js'
],

function(TopBookingsView, AllChannelsView, NowAndNextView) {

	return Backbone.Router.extend({
		
		// To know which view is the current
		current: undefined,

		// Declaring all app routes here
		// "someview": "somehandler"
		routes: {
			"topbookings": "topbookings",
			"allchannels": "allchannels",
			"nowandnext": "nowandnext"

		},
		
		// Some handlers...
		nowandnext: function() {
			this.load('nowandnext', NowAndNextView)
		},

		allchannels: function() {
			this.load('allchannels', AllChannelsView)
		},

		topbookings: function() {
			this.load('topbookings', TopBookingsView)
		},

		// Generic view loader
		load: function(namespace, View) {

			// unload current view
			if (this.current) {
				wo.views[this.current].unload();
			}
			// set the new current
			this.current = namespace;

			// Try to grab the view from the cache
			if (wo.views[namespace]) {
				wo.views[namespace].load();
				return;
			}

			// Otherwise emulate server response
			setTimeout(function() {
				// Create the requested view
				wo.views[namespace] = new View();
			}, 1500);

		}

	});

}); // define