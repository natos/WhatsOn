/* 
* DashboardController
* -------------------
*
*/

define([

	'config/app',
	'config/user',
	'modules/app',
	'lib/flaco/controller',
	'views/dashboard'

], function DashboardController(a, u, App, Controller, DashboardView) {

	var name = 'dashboard';

/* private */

	/**
	 * Handler for the LOGGED_IN event.
	 */
	function userLoggedIn() {

		FB.api({
			method: 'fql.query',
			query: 'SELECT uid, name, pic_square FROM user WHERE is_app_user AND uid IN (SELECT uid2 FROM friend WHERE uid1 = me())',
			accessToken: App.modules.user.model['facebook-status'].authResponse.accessToken
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

/* public */

/* abstract */ 

	function initialize() {

		return this;
	
	};

	function finalize() {

		return this;

	};

/* export */

	return new Controller({
		name		: name,
		initialize	: initialize,
		finalize	: finalize,
		view		: DashboardView
	});

});