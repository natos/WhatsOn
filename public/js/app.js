// App.js 

define([

	// Dependencies
	'routers/AppRouter',

],

function(AppRouter) {

	var app = {

		initialize: function() {

			// Socket.io connection to the backend
			wo.socket = io.connect();
			wo.socket.on('connect', function() {
				// identify this socket with our auth token
				wo.socket.emit('auth', socket_id);
			});

			// Global event dispatcher/handler initialization
			wo.event = _.extend({}, Backbone.Events);
			wo.event.on = wo.events.bind;
			wo.event.emit = wo.events.trigger;

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