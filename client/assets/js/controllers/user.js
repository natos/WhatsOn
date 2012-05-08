/* UserController */
define([

	'config/user',
	'models/user'//,
//	'//connect.facebook.net/en_US/all.js'

], function(u, UserModel) {

/* private */

	// fb mock
	window.FB = {
		init: function() {},
		login: function() {},
		logout: function(){},
		Event: {
			subscribe: function() {}
		}
	}

// funtions

	var facebookLoginStatus = function(response) {


		console.log('Facebook Login Status: ', response.status);
	
		if (response && response.status === 'connected') {
			// the user is logged in and connected to your
			// app, and response.authResponse supplies
			// the user's ID, a valid access token, a signed
			// request, and the time the access token 
			// and signed request each expire
			UserModel.set('facebook', { uid: response.authResponse.userID, accessToken: response.authResponse.accessToken });
		
			// trigger an event, so the app knows the user state
			upc.emit(u.STATUS_CHANGED, { message: u.LOGGED } );
		
		} else if (response && response.status === 'not_authorized') {
			// the user is logged in to Facebook, 
			// but not connected to the app
			// trigger an event, so the app knows the user state
			upc.emit(u.STATUS_CHANGED, { message: u.NOT_AUTHORIZED } );
		
		} else {
			// the user isn't even logged in to Facebook.
			// trigger an event, so the app knows the user state
			upc.emit(u.STATUS_CHANGED, { message: u.NOT_LOGGED } );
		}
	
	},

/* @class User */
	UserController = {};

	/* constructor */
	UserController.initialize = function() {

		// FB init
		FB.init({
			appId      : u.APP_ID,
			status     : true,
			cookie     : true
		});

		// Check Facebook login status
//		FB.getLoginStatus(facebookLoginStatus);

		// Lisent for changes on Facebook login status
		FB.Event.subscribe('auth.statusChange', facebookLoginStatus);

		return this;

	};

	UserController.login = function() {

		FB.login(function(response) { upc.emit(u.LOGIN); }, {scope: u.SCOPE });

	};

	UserController.logout = function() {

		FB.logout(function(response) { upc.emit(u.LOGOUT); });

	};

	return UserController;

});