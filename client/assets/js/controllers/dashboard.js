/* 
* DashboardController
* -------------------
*
*/

define([

	'config/app',
	'config/user',
	'controllers/app',
	'views/dashboard',
	'components/carousel'

], function DashboardController(c, u, App, DashboardView, Carousel) {

/* private */
	
	function initialize() {
	
		// Let the App know your here
		App.controllers.dashboard = this;

		// configure and run components
		this.components = {
			carousel: Carousel.initialize('#featured') // dom query to select the carousel
		};

		upc.on(u.LOGGED_IN, userLoggedIn);
		upc.on(u.LOGGED_OUT, userLoggedOut);

		return this;
	
	};

	function userLoggedIn() {

		FB.api({
			method: 'fql.query',
			query: 'SELECT uid, name, pic_square FROM user WHERE is_app_user AND uid IN (SELECT uid2 FROM friend WHERE uid1 = me())',
			accessToken: upc.controllers.user.model['facebook-status'].authResponse.accessToken
		},
		function(response) {
			console.log(response);
		});

	};

	function userLoggedOut() {

		FB.api({
			method: 'fql.query',
			query: 'SELECT uid, name, pic_square FROM user WHERE is_app_user IN (SELECT uid2 FROM friend WHERE uid1 = me())'
		},
		function(response) {
			console.log(response);
		});

	};

/* public */

/* @class Dashboard */
	return {
		/* constructor */
		initialize: initialize,
		view: DashboardView.initialize()
	};

});