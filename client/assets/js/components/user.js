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

	statusChanged = function(event) {

		console.log('statusChanged', event);

	},

/* @class User */
	User = {};

	/* constructor */
	User.initialize = function() {

		upc.on(u.STATUS_CHANGED, statusChanged);

		$button.click(function(event) {
			event.preventDefault();
			u.login();
		});

	};

	return User;

});