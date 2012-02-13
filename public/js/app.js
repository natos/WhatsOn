// App.js 

define([

	// Dependencies
	'routers/AppRouter',

],

function(AppRouter) {

	var app = {

		initialize: function() {

			// Global event dispatcher/handler initialization
			wo.events = _.extend({}, Backbone.Events);
			// Test bindings
			wo.events.bind('view-initialized', function(event){
				console.log('view-initialized event cached')
			});
/*
			// Socket.io connection to the backend
			wo.socket = io.connect();
			wo.socket.on('connect', function() {
				// identify this socket with our auth token
				wo.socket.emit('auth', socket_id);
			});
*/
			// Global event dispatcher/handler initialization
			wo.event = _.extend({}, Backbone.Events);
			// Normalize interfaces
			wo.event.on = wo.event.bind;
			wo.event.emit = wo.event.trigger;

			// Router initialization
			wo.router = new AppRouter();

			// Navigate to Now And Next by default
			if ( !(/#/).test(window.location.toString()) ) {
				wo.router.navigate('allchannels');
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