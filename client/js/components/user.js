/*
* UserControl
* -----------
* @class UserControl
*/

define([

	'config/user',
	'models/user'

], function UserControl(u, UserModel) {

/* private */

// constants

	var	CURRENT_STATUS = u.UNKNOWN,

	// pulldown
	pulldown = {

		toggle: function() { 
			if (u.$userControl.hasClass('active')) { this.hide(); } else { this.show(); } 
			return this; 
		},

		show: function() {	
			u.$body.one('click', function(event) { pulldown.hide(); });
			u.$userControl.addClass('active'); 
			return this; 
		},

		hide: function() {	
			u.$userControl.removeClass('active'); return this; 
		}

	};

// functions

	/* constructor */
	function initialize() {

		// Handle when the user model change
		upc.on(u.MODEL_CHANGED, manageModelChanges);

		// UI Events
		u.$userControl.on('click', 'a', handleUserControlClick);
		u.$loginButton.on('click', handleLoginButtonClick);

		return this;

	}

	function manageModelChanges(event) {

		// Login Status has changed
		if (event['facebook-status']) {
			manageLoginStatus(event['facebook-status']);
		}

	}

	function manageLoginStatus(event) {

		switch (event.status) {

			case u.CONNECTED:
				u.$loginButton.html('<img class="picture" src="https://graph.facebook.com/' + event.authResponse.userID + '/picture" />');
				break;

			case u.NOT_AUTHORIZED:
			case u.UNKNOWN:
				u.$loginButton.html('<i class="icon-user"></i><b class="label">Login</b>');
				break;
		}

		// save current status
		CURRENT_STATUS = event.status;

	}

	// handle a.login behavior
	function handleLoginButtonClick(event) {

		event.preventDefault();
		event.stopPropagation();

		switch (CURRENT_STATUS) {

			case u.CONNECTED:
				pulldown.toggle();
				break;

			case u.NOT_AUTHORIZED:
			case u.UNKNOWN:
				upc.emit(u.LOG_IN);
				break;

		}

	}

	// handle usercontrol behavior
	function handleUserControlClick(event) {

		switch (this.className) {

			case "settings":
				console.log('settings');
				break;

			case "logout":
				event.preventDefault();
				upc.emit(u.LOG_OUT);
				// TODO: Redirect to homepage
//				UserController.logout();
				break;

		}

	}

/* public */
	return {
		initialize: initialize
	};

});