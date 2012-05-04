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

			case u.NOT_LOGGED:
			case u.NOT_AUTHORIZED:
			default:
				u.$button.html('<i class="icon-user"></i><b class="label">Login</b>');
				break;
		}

		// save current status
		CURRENT_STATUS = event.message;

	},

	manageModelChanges = function(event) {

		console.log(event);

	},

	// handle a.login behavior
	handleButtonClick = function(event) {

		event.preventDefault();
		event.stopPropagation();

		switch (CURRENT_STATUS) {

			case u.LOGGED:
				User.pulldown.toggle();
				break;

			case u.NOT_LOGGED:
			case u.NOT_AUTHORIZED:
			default: 
				UserController.login();
				break;

		}

	},

	// handle usercontrol behavior
	handleUserControlClick = function(event) {
		
		event.preventDefault();
		event.stopPropagation();

		switch (this.className) {

			case "settings":
				console.log('settings');
				break;

			case "logout":
				UserController.logout();
				User.pulldown.hide();
				break;

		}

	},

/* @class User */
	User = {};

	/* constructor */
	User.initialize = function() {

		// Handle when the login status change
		upc.on(u.STATUS_CHANGED, manageLoginStatus);
		// Handle when the user model change

		upc.on(u.MODEL_CHANGED, manageModelChanges);

		// UI Events
		u.$button.on('click', handleButtonClick);
		u.$userControl.on('click', 'a', handleUserControlClick);
		y.$body.on('click', User.pulldown.hide());
	};

	User.pulldown = {

		toggle: function() { if (u.$userControl.hasClass('active')) { this.hide(); } else { this.show(); } return this; },

		show: function() {	u.$userControl.addClass('active'); return this; },

		hide: function() {	u.$userControl.removeClass('active'); return this; }

	}

	return User;

});