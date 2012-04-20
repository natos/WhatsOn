// App.js 

// DOM utility 		https://github.com/ded/bonzo
// Selector Engine 	https://github.com/ded/qwery

define([

	// Dependencies
//	'routers/AppRouter'
	'views/UserControlView'
,	'views/HeaderSearchFormView'
],

function(UserControl, HeaderSearchFormView) {

	var TEST_MODE = $('head').attr('data-test').toLocaleLowerCase() === 'true'; // TEST_MODE

	var app = {

		initialize: function() {

			// TEST_MODE Resources
			if (TEST_MODE) {
				// Load QUnit JS
				require(['js/libs/qunit/qunit.js']);
				// Load QUnit CSS
			    var link = document.createElement("link");
			    	link.type = "text/css";
				    link.rel = "stylesheet";
			    	link.href = "/css/libs/qunit/qunit.css";
			    document.getElementsByTagName("head")[0].appendChild(link);
			}

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
//			wo.views.headerSearchForm = new HeaderSearchFormView();

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

					if (TEST_MODE) {
						require(['tests/GridTest'], function(GridTest){
							new GridTest();
						});
					}

				});
			}

			// list
			if ( /list/.test( window.location.toString() ) ) {
				require(['views/ListView'], function(List){
					wo.views.list = new List();
				});
			}

			// search results
			if ( /search/.test( window.location.toString() ) ) {
				require(['views/SearchResultsView'], function(SearchResults){
					wo.views.search = new SearchResults();
				});
			}

			// search
			wo.event.on('search-results-events', function(o){
				alert(o.length + ' search results received');
				console.log(o);
				console.log(o.model());
			});

			return this;

		}

	}

	return app;

}); // define