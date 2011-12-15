// AppRouter.js

define([

	'views/NowAndNextView'
],

function(NowAndNextView) {

	return Backbone.Router.extend({
		
		// To know which view is the current
		current: undefined

		// Declaring all app routes here
		// "someview": "somehandler"
,		routes: {
			"nowandnext"	: "nowandnext"
		}

		// Some handlers...
,		nowandnext: function() {
			this.load('nowandnext', NowAndNextView)
		}

		// Generic view loader
,		load: function(namespace, View) {

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

			// Create the requested view
			wo.views[namespace] = new View();
			wo.views[namespace].bind('view-created', function(){

			});
		}

	});

}); // define