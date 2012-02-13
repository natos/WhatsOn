// UserControlView.js

define([
],

function() {

	return Backbone.View.extend({

		el: $('#user-control')

	,	SCOPE: 'email, user_interests, user_likes, user_online_presence, friends_online_presence, publish_actions'

//	,	template: _.template( template )

	,	initialize: function() {

			// Check Facebook login status
			FB.getLoginStatus( this.facebookLoginStatus );
			// Lisent for changes on Facebook login status
			FB.Event.subscribe('auth.statusChange', this.facebookLoginStatus);

			this.trigger('view-initialized', this);
		}

	,	load: function() {

//			this.el.html( this.template() );

			this.trigger('view-created');

		}

	,	unload: function() {

			this.el.html( '' );

			this.trigger('view-unloaded', this);

		}

	,	facebookLoginStatus: function(response) {

			console.log('facebook login status');
			console.log(response);

			if (response.status === 'connected') {
				// the user is logged in and connected to your
				// app, and response.authResponse supplies
				// the user's ID, a valid access token, a signed
				// request, and the time the access token 
				// and signed request each expire
				var uid = response.authResponse.userID;
				var accessToken = response.authResponse.accessToken;

				console.log('User logged');

			} else if (response.status === 'not_authorized') {
				// the user is logged in to Facebook, 
				// but not connected to the app

				console.log('User logged but not authorized');

			} else {
				// the user isn't even logged in to Facebook.

				console.log('User NOT logged');
			}

		}

	});

}); // define