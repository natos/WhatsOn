// App.js 

define([

	// Dependencies
//	'routers/AppRouter'
	'views/UserControlView'
],

function(UserControl) {

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
				require(['views/UserActionView'], function(UserAction) {
					wo.views.useraction = new UserAction();
				});
			}

			// TopBookings slide
			if ( !(/#/).test(window.location.toString()) ) {
				require(['views/TopBookingsView'], function(TopBookings){
					wo.views.topbookings = new TopBookings();
				});
			}

			// grid
			if ( /grid/.test( window.location.toString() ) ) {
				require(['views/GridView'], function(Grid){
					wo.views.grid = new Grid();
				});
			}

			wo.getCoolPic = (function(){

				var cool_pics = [
					'http://tv.sky.com/asset/show/8ad586a135af96b70135afe916940151.jpg'
				,	'http://tv.sky.com/asset/show/8ad586a135af96b70135afead6ef0166.jpg'
				,	'http://tv.sky.com/asset/show/8ad586a135c83fb50135e242d4720a75.jpg'
				,	'http://tv.sky.com/asset/show/8ad586a135af96b70135c381691a0a27.jpg'
				,	'http://tv.sky.com/asset/show/8ad586a135af96b70135aff20fb801b2.jpg'
				,	'http://tv.sky.com/asset/show/8ad586a135af96b70135c3910b330a31.jpg'
				,	'http://tv.sky.com/asset/show/8ad586a135af96b70135afece649017b.jpg'
				,	'http://tv.sky.com/asset/show/8ad586a135af96b70135aff4c1ae01db.jpg'
				,	'http://tv.sky.com/asset/show/8ad586a135af96b70135aff6b58a01f0.jpg'
				,	'http://tv.sky.com/asset/show/8ad586a135af96b70135aff825040205.jpg'
				,	'http://tv.sky.com/asset/show/8ad586a135af96b70135b0254f4e0341.jpg'
				,	'http://tv.sky.com/asset/show/8ad586a135af96b70135b033bc610391.jpg'
				,	'http://tv.sky.com/asset/show/8ad586a135af96b70135b03b20bc03e2.jpg'
				,	'http://tv.sky.com/asset/show/8ad586a135af96b70135b0397b5903cb.jpg'
				,	'http://tv.sky.com/asset/show/8ad586a135af96b70135bf64939309ea.jpg'
				,	'http://tv.sky.com/asset/show/8ad586a135af96b70135b03cce4703f5.jpg'
				,	'http://tv.sky.com/asset/show/8ad586a135af96b70135bf41ffe609d3.jpg'
				,	'http://tv.sky.com/asset/show/8ad586a135af96b70135be79610005ee.jpg'
				,	'http://tv.sky.com/asset/show/8ad586a135af96b70135be6725af05b7.jpg'
				,	'http://tv.sky.com/asset/show/8ad586a135af96b70135bf45fd6709da.jpg'
				,	'http://tv.sky.com/asset/show/8ad586a135af96b70135bf50c0b809e1.jpg'
				,	'http://tv.sky.com/asset/show/8ad586a135af96b70135c3cf710e0a6b.jpg'
				,	'http://tv.sky.com/asset/show/8ad586a135af96b70135c3d2edf90a6f.jpg'
				,	'http://tv.sky.com/asset/show/8ad586a135c83fb50135c869800b0001.jpg'
				,	'http://tv.sky.com/asset/show/8ad586a135af96b70135bed29b9f078c.jpg'
				,	'http://tv.sky.com/asset/show/8ad586a135af96b70135bec8927d0730.jpg'
				,	'http://tv.sky.com/asset/show/8ad587a135e838d50135ee54544f075c.jpg'
				,	'http://tv.sky.com/asset/show/8ad587a135c42a2c0135c4fcb2980053.jpg'
				,	'http://tv.sky.com/asset/show/8ad586a135c83fb50135c87e4ace0011.jpg'
				,	'http://tv.sky.com/asset/show/8ad586a135c83fb50135c87d21f9000c.jpg'
				,	'http://tv.sky.com/asset/show/8ad586a135c83fb50135c8795ab80008.jpg'
				,	'http://tv.sky.com/asset/show/8ad586a135af96b70135c3e20a470a7c.jpg'
				,	'http://tv.sky.com/asset/show/8ad586a135af96b70135bf7cd35a09f7.jpg'
				]


				var picked_ones = [];

				var get_random = function(min) {

					return Math.floor(Math.random() * (cool_pics.length - min + 1)) + min;

				}

				var is_used = function(v) {

					var len = picked_ones.length;
				
					while (len--) {
						if (picked_ones[len] === v) {
							return true;
						}
					}

					return false;
				}

				return function(min) {

					while ( is_used( rnd = get_random(min) ) ) {
						console.log(rnd + ' repeated');
					}

					console.log(rnd);
					picked_ones.push(rnd);

					return cool_pics[rnd] || cool_pics[rnd-1];
	
				}

			})();

			return this;

		}

	}

	return app;

}); // define