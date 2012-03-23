// UserControlView.js

define([

//	'templates/UserControlTemplate'

],

function() {

	return Backbone.View.extend({

		el: $('#user-control')

	,	fbbtn: $('.fb')

	,	SCOPE: 'email, user_interests, user_likes, user_online_presence, friends_online_presence, publish_actions'

//	,	template: _.template( template )

	,	initialize: function() {

			// FB init
			FB.init({
				appId      : '153316508108487' // App ID
			,	channelUrl : '//upcwhatson.herokuapp.com/channel.html' // Channel File
			,	status     : true	// check login status
			,	cookie     : true	// enable cookies to allow the server to access the session
			,	xfbml      : true	// parse XFBML
			});

			this.trigger('view-initialized', this);

			// self load
			this.load();
		}

	,	load: function() {

			var self = this;

			// Check Facebook login status
			FB.getLoginStatus(function(response) {
				self.facebookLoginStatus.call(self, response);
			});

			// Lisent for changes on Facebook login status
			FB.Event.subscribe('auth.statusChange', function(response) {
				self.facebookLoginStatus.call(self, response);
			});

			this.trigger('view-created');

		}

	,	unload: function() {

			this.el.html( '' );

			this.trigger('view-unloaded', this);

		}


// Base login/logout functions

	,	login: function(event) {

			var self = this;

			FB.login(function(response) {

			}, {scope: self.SCOPE });


		}

	,	logout: function(event) {

			var self = this;

			FB.logout(function(response) {

			});

		}

// Facebook Login Status Handler

	,	facebookLoginStatus: function(response) {

			if (response && response.status === 'connected') {
				// the user is logged in and connected to your
				// app, and response.authResponse supplies
				// the user's ID, a valid access token, a signed
				// request, and the time the access token 
				// and signed request each expire
				var uid = response.authResponse.userID;
				var accessToken = response.authResponse.accessToken;

				this.facebook = {
					uid: uid
				,	accessToken: accessToken
				}

				this.fbbtn
					.off() // remove all handlers
					.on('click', this.logout)
					.html('Logout');

				this.fbbtn.html('<img src="https://graph.facebook.com/' + uid + '/picture">');

				// trigger an event, so the app knows the user state
				wo.event.emit('login-status', { message: 'logged', facebook: this.facebook } );

			} else if (response && response.status === 'not_authorized') {
				// the user is logged in to Facebook, 
				// but not connected to the app
				this.fbbtn
					.off() // remove all handlers
					.on('click', this.login)
					.html('Authorize App');

				// trigger an event, so the app knows the user state
				wo.event.emit('login-status', { message: 'not-authorized', facebook: this.facebook } );

			} else {
				// the user isn't even logged in to Facebook.
				this.fbbtn
					.off() // remove all handlers
					.on('click', this.login)
					.html('Login');

				// trigger an event, so the app knows the user state
				wo.event.emit('login-status', { message: 'not-logged' } );
			}

		}

	});

}); // define