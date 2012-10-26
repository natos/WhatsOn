/*
* UserControl
* -----------
* @class UserControl
*/

define([

	'config/app',
	'config/user',
	'modules/app',
	'modules/event',
	'models/user',
	'utils/dom'

], function UserControl(a, u, App, Event, UserModel, dom) {

/* private */

// constants

	var	CURRENT_STATUS = u.UNKNOWN,

// DOM access

	loginButton = dom.doc.querySelectorAll('.menu-item.login'),

	userControl = dom.doc.getElementById('user-control'),

// pulldown
	pulldown = {
		toggle: function() {
			if (/active/.test(userControl.className)) { this.hide(); } else { this.show(); }
			return this;
		},
		show: function() {
			userControl.className = 'active';
			return this; 
		},
		hide: function() {
			userControl.className = '';
			return this;
		}
	};

// functions

	/* constructor */
	function initialize() {

		// Handle when the user model change
		Event.on(u.MODEL_CHANGED, manageModelChanges);

		// Listen to actions
		Event.on(a.ACTION, manageActions);

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
				dom.doc.querySelectorAll('.menu-item.login')[0].innerHTML = '<img class="picture" src="https://graph.facebook.com/' + event.authResponse.userID + '/picture" />';
				break;

			case u.NOT_AUTHORIZED:
			case u.UNKNOWN:
				dom.doc.querySelectorAll('.menu-item.login')[0].innerHTML = '<i class="icon-user"></i><b class="label">Login</b>';
				break;
		}

		// save current status
		CURRENT_STATUS = event.status;

	}

	// handle a.login behavior
	function handleLogin() {

		switch (CURRENT_STATUS) {

			case u.CONNECTED:
				pulldown.toggle();
				break;

			case u.NOT_AUTHORIZED:
			case u.UNKNOWN:
				Event.emit(u.LOG_IN);
				break;

		}
	}

	function handleLogout() {

		switch (CURRENT_STATUS) {

			case u.CONNECTED:
				Event.emit(u.LOG_OUT);

			case u.NOT_AUTHORIZED:
			case u.UNKNOWN:
				break;

		}
	}

	// handle usercontrol behavior
	function manageActions(action) {

		switch (action) {

			case 'LOGIN':
				handleLogin();
				break;

			// hide the menu on logout
			case 'LOGOUT': handleLogout();
			// hide the menu when navigate
			case a.NAVIGATE:
			// a VOID action is triggered when clicks in any non-interactive content
			// in that case, we want to close the menu
			case a.VOID:
			default:
				pulldown.hide();
				break;
		}

	}

/* public */
	return {
		initialize: initialize
	}

});