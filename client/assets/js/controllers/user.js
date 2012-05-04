define([

	'//connect.facebook.net/en_US/all.js'

], function() {

/* private */

// constants

var SCOPE = 'email, user_interests, user_likes, user_location, friends_likes, publish_actions, user_activities, user_events, friends_events, friends_online_presence, read_friendlists, user_online_presence, status_update, publish_stream, share_item, create_event, rsvp_event',

// events

	STATUS_CHANGED = 'user:status_changed',

// messages

	NOT_AUTHORIZED = 'user:not_authorized',

	NOT_LOGGED = 'user:not_logged',

	LOGGED = 'user:logged',

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
		
			UserController.facebook = {
				uid: uid
			,	accessToken: accessToken
			}
		
			// trigger an event, so the app knows the user state
			upc.emit(STATUS_CHANGED, { message: LOGGED } );
		
		} else if (response && response.status === 'not_authorized') {
			// the user is logged in to Facebook, 
			// but not connected to the app
		
			// trigger an event, so the app knows the user state
			upc.emit(STATUS_CHANGED, { message: NOT_AUTHORIZED } );
		
		} else {
			// the user isn't even logged in to Facebook.
		
			// trigger an event, so the app knows the user state
			upc.emit(STATUS_CHANGED, { message: NOT_LOGGED } );
		}
	
	},

/* @class User */
	UserController = {};

	/* constructor */
	UserController.initialize = function() {

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

		upc.emit('user:started');

		console.log('UserController initializated');

		return this;

	};

	UserController.login = function() {

		FB.login(function(response) {

		}, {scope: SCOPE });

	};

	UserController.logout = function() {

		FB.logout(function(response) {

		});

	};

	return UserController;

});