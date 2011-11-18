// App.js 

define([

	// Dependencies
	'routers/AppRouter',

	'js/libs/backbone/backbone.js',
	'js/libs/iscroll.js'
],

function(AppRouter) {

	var app = {

		initialize: function() {
			
			// Router initialization
			wo.router = new AppRouter();
			
			// All content is displayed on #conten, so any time we load something new
			// we need to recalculate the scrolling properties
			$(window).bind('view-loaded', function(event){
				// When a new view is loaded, distroy existing scroll object
				if (wo.scroll) { wo.scroll.destroy() } 
				// Then create a new scroll to calculate every detail again
				wo.scroll = new iScroll('content');
			});

			// Initializate history managment
			Backbone.emulateHTTP = true;
			Backbone.emulateJSON = true;
			Backbone.history.start();

			return this;

		}

	}

	return app;

}); // define