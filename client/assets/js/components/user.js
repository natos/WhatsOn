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

	},

/* @class User */
	User = {};

	/* constructor */
	User.initialize = function() {

		upc.on(u.STATUS_CHANGED, manageLoginStatus);

		console.log('user widget loaded, waiting for events');

		$button.click(function(event) {
			event.preventDefault();
			u.login();
		});

	};

	return User;

});