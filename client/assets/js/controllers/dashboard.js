/* 
* DashboardController
* -------------------
*
*/

define([

	'config/app',
	'config/user',
	'modules/app',
	'views/dashboard'

], function DashboardController(a, u, App, DashboardView) {

/* private */
	
	function initialize(arguments) {

		upc.on(u.LOGGED_IN, userLoggedIn);
		upc.on(u.LOGGED_OUT, userLoggedOut);

		DashboardView.initialize();

		return this;
	
	};

	function finalize() {
	
		upc.off(u.LOGGED_IN, userLoggedIn);
		upc.off(u.LOGGED_OUT, userLoggedOut);

		DashboardView.finalize();

		return this;
	
	};

	function userLoggedIn() {

		FB.api({
			method: 'fql.query',
			query: 'SELECT uid, name, pic_square FROM user WHERE is_app_user AND uid IN (SELECT uid2 FROM friend WHERE uid1 = me())',
			accessToken: upc.user.model['facebook-status'].authResponse.accessToken
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
		name: 'dashboard',
		/* constructor */
		initialize: initialize,
		view: DashboardView
	};

});