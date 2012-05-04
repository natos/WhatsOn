define([

	'//connect.facebook.net/en_US/all.js'

], function() {

/* private */

// constants

var SCOPE = 'email, user_interests, user_likes, user_online_presence, friends_online_presence, publish_actions',

// events

	STATUS_CHANGED = 'user:status-changed',

// funtions

	facebookLoginStatus = function(response) {

		console.log(response);

		if (response && response.status === 'connected') {
			// the user is logged in and connected to your
			// app, and response.authResponse supplies
			// the user's ID, a valid access token, a signed
			// request, and the time the access token 
			// and signed request each expire
			var uid = response.authResponse.userID;
			var accessToken = response.authResponse.accessToken;
		
			User.facebook = {
				uid: uid
			,	accessToken: accessToken
			}
		
			// trigger an event, so the app knows the user state
			upc.emit(STATUS_CHANGED, { message: 'logged' } );
		
		} else if (response && response.status === 'not_authorized') {
			// the user is logged in to Facebook, 
			// but not connected to the app
		
			// trigger an event, so the app knows the user state
			upc.emit(STATUS_CHANGED, { message: 'not-authorized' } );
		
		} else {
			// the user isn't even logged in to Facebook.
		
			// trigger an event, so the app knows the user state
			upc.emit(STATUS_CHANGED, { message: 'not-logged' } );
		}
	
	},

/* @class User */
	User = {};

	/* constructor */
	User.initialize = function() {

		// FB init
		FB.init({
			appId      : '290742221014129',
			channelUrl : '//upcsocial.herokuapp.com/channel.html',
			status     : true,
			cookie     : true
		});

		// Check Facebook login status
		FB.getLoginStatus(facebookLoginStatus);

		// Lisent for changes on Facebook login status
		FB.Event.subscribe('auth.statusChange', facebookLoginStatus);

		return this;

	};

	User.login = function() {

		FB.login(function(response) {

		}, {scope: SCOPE });

	};

	User.logout = function() {

		FB.logout(function(response) {

		});

	};

	return User;

});