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

			// open a socket.io connection to the backend
			var socket = io.connect();

			socket.on('connect', function() {

				// identify this socket with our auth token
				socket.emit('auth', socket_id);

				// when a friend is received from the backend, add it to the page
				socket.on('friend-using-app', function(friend) {
					$('ul#friends-using-app').append('                                                    \
					<li>                                                                                \
						<a href="" onclick="window.open(\'http://www.facebook.com/' + friend.uid + '\');"> \
						<img src="' + friend.pic_square + '" alt="' + friend.name + '">                 \
						</a>                                                                              \
					</li>                                                                               \
          			');
		        });
			});

			return this;

		}

	}

	return app;

}); // define