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
			wo.events.on('friend-using-app', function(event) {
				wo.socket.on('friend-using-app', function(data) {
					wo.events.emit('friend-using-app', data)
				});
				wo.socket.emit('friend-using-app');
			});

			// Router initialization
			wo.router = new AppRouter();
			// Navigate to Now And Next by default
			if ( !(/#/).test(window.location.toString()) ) {
				wo.router.navigate('nowandnext');
			}
			// Socket.io connection to the backend
			wo.socket = io.connect();
			wo.socket.on('connect', function() {
				// identify this socket with our auth token
				wo.socket.emit('auth', socket_id);
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