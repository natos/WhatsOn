// App.js 

define([

	// Dependencies
//	'routers/AppRouter'
	'views/UserControlView'
,	'views/UserActionView'

],

function(UserControl, UserAction) {

	var app = {

		initialize: function() {

			// Views namespace
			wo.views = {};
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

/*
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
*/

			wo.views.usercontrol = new UserControl();

			// user action
			if ( /programme/.test( window.location.toString() ) ) {
				wo.views.useraction = new UserAction();
			}
			
			return this;

		}

	}

	return app;

}); // define