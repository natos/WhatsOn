// App.js 

define([

	// Dependencies
	'routers/AppRouter',

],

function(AppRouter) {

	var app = {

		initialize: function() {

			setTimeout( function() { window.scrollTo(0,1) } , 100);

			// Global event dispatcher/handler initialization
			wo.events = _.extend({}, Backbone.Events);
			// Test bindings
			wo.events.bind('view-initialized', function(event){
				console.log('view-initialized event cached')
			});

			// Router initialization
			wo.router = new AppRouter();
			// Navigate to Now And Next by default
			if ( !(/#/).test(window.location.toString()) ) {
				wo.router.navigate('nowandnext');
			}

			// Initializate history managment
			Backbone.emulateHTTP = true;
			Backbone.emulateJSON = true;
			Backbone.history.start();

			return this;

		}

	}

	return app;

}); // define