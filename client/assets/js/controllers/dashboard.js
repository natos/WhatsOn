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

	/**
	 * Activate the associated view, and set up event handlers
	 * @public
	 */
	function initialize(arguments) {

		upc.on(u.LOGGED_IN, userLoggedIn);
		upc.on(u.LOGGED_OUT, userLoggedOut);

		DashboardView.initialize();

		return this;
	
	};

	/**
	 * Deactivate the associated view, and clean up event handlers
	 * @public
	 */
	function finalize() {
	
		upc.off(u.LOGGED_IN, userLoggedIn);
		upc.off(u.LOGGED_OUT, userLoggedOut);

		DashboardView.finalize();

		return this;
	
	};

	/**
	 * Handler for the LOGGED_IN event.
	 */
	function userLoggedIn() {

		FB.api({
			method: 'fql.query',
			query: 'SELECT uid, name, pic_square FROM user WHERE is_app_user AND uid IN (SELECT uid2 FROM friend WHERE uid1 = me())',
			accessToken: upc.modules.user.model['facebook-status'].authResponse.accessToken
		},
		function(response) {
			console.log(response);
		});

	};

	/**
	 * Handler for the LOGGED_OUT event.
	 */
	function userLoggedOut() {

		FB.api({
			method: 'fql.query',
			query: 'SELECT uid, name, pic_square FROM user WHERE is_app_user IN (SELECT uid2 FROM friend WHERE uid1 = me())'
		},
		function(response) {
			console.log(response);
		});

	};


	/* @class Dashboard */
	return {
		name: 'dashboard',
		initialize: initialize,
		finalize: finalize,
		view: DashboardView
	};

});