/* UserComponent */
define([

	'config/user',
	'models/user',
	'controllers/user'

], function(u, UserModel, UserController) {

/* private */

// constants

var	CURRENT_STATUS = u.NOT_LOGGED,

// functions

	manageLoginStatus = function(event) {

		switch (event.message) {

			case u.LOGGED:
				u.$button.html('<img class="picture" src="https://graph.facebook.com/' + UserModel.facebook.uid + '/picture" />');
				break;

			case u.NOT_LOGGED: break;	

			case u.NOT_AUTHORIZED: break;	

			default: break;
		}

		// save current status
		CURRENT_STATUS = event.message;

	},

	manageModelChanges = function(event) {

		console.log(event);

	},

	// handle <a> behavior
	handleButtonClick = function(event) {

		event.preventDefault();

		switch (CURRENT_STATUS) {

			case u.LOGGED:
				UserController.logout();
				break;

			case u.NOT_LOGGED:
			case u.NOT_AUTHORIZED:
			default: 
				UserController.login();
				break;

		}

	},

/* @class User */
	User = {};

	/* constructor */
	User.initialize = function() {

		// Data Events
		upc.on(u.STATUS_CHANGED, manageLoginStatus);
		upc.on(u.MODEL_CHANGED, manageModelChanges);

		// UI Events
		u.$button.click(handleButtonClick);

	};

	return User;

});