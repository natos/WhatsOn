// App.js 

define([

	// Dependencies
	'routers/AppRouter'

],

function(AppRouter) {

	var app = {

		initialize: function() {

			Backbone.emulateJSON = true;
			Backbone.history.start({pushState: true});

			return this;

		}

	}

	app.router = new AppRouter;
	app.router.navigate('allchannels');

	return app;

}); // define