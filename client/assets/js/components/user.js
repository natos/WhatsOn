define([

	'controllers/user'

], function(UserController) {

/* private */

// constants

var u = UserController,

// DOM access

	$body = $('body'),

	$button = $('.login'),

	$userControl = $('#user-control'),

// functions

	manageLoginStatus = function(event) {

		console.log('manageLoginStatus');
		console.log(event);
		console.log(event.message);

		console.log(u);

		switch (event.message) {

			case u.LOGGED:
				$button.html('<img class="picture" src="https://graph.facebook.com/' + u.facebook.uid + '/picture" />');
				break;

			case u.NOT_LOGGED: break;	

			case u.NOT_AUTHORIZED: break;	

			default: break;
		}

	},

/* @class User */
	User = {};

	/* constructor */
	User.initialize = function() {

		console.log(u);

		upc.on(u.STATUS_CHANGED, manageLoginStatus);

		upc.on(u.STARTED, function(event) {
			console.log('user:started', event);
		});

		console.log('user widget loaded, waiting for events');

		$button.click(function(event) {
			event.preventDefault();
			u.login();
		});

	};

	return User;

});