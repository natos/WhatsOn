// UserControlView.js

define([

	'templates/UserControlTemplate'

],

function(template) {

	return Backbone.View.extend({

		el: $('#user-control')

	,	SCOPE: 'email, user_interests, user_likes, user_online_presence, friends_online_presence, publish_actions'

	,	template: _.template( template )

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
		}

	,	load: function() {

			this.el.html( this.template() );

			this.fbbtn = this.el.find('.fb.btn');

			// Check Facebook login status
			FB.getLoginStatus( this.facebookLoginStatus );
			// Lisent for changes on Facebook login status
			FB.Event.subscribe('auth.statusChange', this.facebookLoginStatus);

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

				self.facebookLoginStatus(response);

			}, {scope: self.SCOPE });


		}

	,	logout: function(event) {

			var self = this;

			FB.logout(function(response) {

				self.facebookLoginStatus(response);

			});

		}

// Facebook Login Status Handler

	,	facebookLoginStatus: function(response) {

			console.log('facebook login status hanlder');
			console.log(response);
			
			if (response && response.status === 'connected') {
				// the user is logged in and connected to your
				// app, and response.authResponse supplies
				// the user's ID, a valid access token, a signed
				// request, and the time the access token 
				// and signed request each expire
				var uid = response.authResponse.userID;
				var accessToken = response.authResponse.accessToken;

				this.fbbtn
					.one(this.logout)
					.html('Logout');

			} else if (response && response.status === 'not_authorized') {
				// the user is logged in to Facebook, 
				// but not connected to the app
				this.fbbtn
					.one(this.login)
					.html('Authorize App');


			} else {
				// the user isn't even logged in to Facebook.
				this.fbbtn
					.one(this.login)
					.html('Login');
			}

		}

	});

}); // define