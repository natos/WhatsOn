/* 
* UserController
* --------------
*
* Controll user preferences
*
*/
define([

	'config/user',
	'models/user',
	'components/user'

], function UserController(u, UserModel, UserComponent) {

	// fb mock
	if (!window.FB) { window.FB = { init: function() {}, login: function() {}, logout: function() {}, Event: { subscribe: function() {} } }; }

/* private */

	/* constructor */
	function initialize() {

		// FB init
		FB.init({
			appId		: u.APP_ID,
			status		: true,
			cookie		: true,
			xfbml		: true
		});

		// Lisent for changes on Facebook login status
		FB.Event.subscribe('auth.statusChange', facebookLoginStatus);

		this.components = {
			user: UserComponent.initialize()
		}

		// Check Facebook login status
		//FB.getLoginStatus(facebookLoginStatus);

		upc.on(u.LOG_IN, login);
		upc.on(u.LOG_OUT, logout);

		return this;

	};

	function facebookLoginStatus(response) {
	
		UserModel.set('facebook-status', response);

	};

	function login() {

		FB.login(function(response) { upc.emit(u.LOGGED_IN); }, { scope: u.SCOPE });

	};

	function logout() {

		FB.logout(function(response) { upc.emit(u.LOGGED_OUT); });

	};

/* public */
	return {
		initialize: initialize
	};

});