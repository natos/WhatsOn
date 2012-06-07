/* 
* UserModule
* ----------
*
* Control user preferences
*
*/
define([

	'config/user',
	'modules/app',
	'models/user',
	'components/user'

], function UserModule(u, App, UserModel, UserComponent) {

	var name = 'user';

/* private */

	// every time the facebook login status
	// is changed, this handler will save the
	// response in the UserModel and trigger
	// some events to let know everyone what
	// just happend
	function facebookLoginStatus(response) {

		UserModel.set('facebook-status', response);

		switch (response.status) {
			case u.CONNECTED: 
				connected(); 
				break;

			case u.NOT_AUTHORIZED:
			case u.UNKNOWN:
				disconnected();
				break;
		}

	};

	function login() {
		FB.login(function(response) { }, { scope: u.SCOPE });
	};

	function logout() {
		FB.logout(function(response) { });
	};

	function fetchFavorites() {
		FB.api('/me/upcsocial:favorite', function(response) { UserModel.set('favorites', response); });
	};

	function fetchRecordings() {
		FB.api('/me/upcsocial:record', function(response) { UserModel.set('recorded', response); });
	};

	/* actions when user is connected */
	function connected() {
		// when a user is identificated
		// fetch relevant data from OG
		App.emit(u.FETCH_FAVORITES);
		App.emit(u.FETCH_RECORDINGS);
		// let know eveyone
		App.emit(u.LOGGED_IN);

	};

	/* actions when user is disconnected */
	function disconnected() {
		// let know eveyone
		App.emit(u.LOGGED_OUT);
	};


/* public */

	function initialize() {

		// FB SDK fallback
		if (typeof FB === 'undefined') {
			console.log('User: waiting for facebook SDK');
			require(['http://connect.facebook.net/en_US/all.js'], function() { 
				// re-initialize when FB is ready
				initialize();
				console.log('User: facebook SDK ready!'); 
			});
			return;
		};

		// FB init
		FB.init({
			appId		: u.APP_ID,
			status		: true,
			cookie		: true,
			xfbml		: true
		});

		// Lisent for changes on Facebook login status
		FB.Event.subscribe('auth.statusChange', facebookLoginStatus);

		this.components = {
			user: UserComponent.initialize()
		}

		// Check Facebook login status
		//FB.getLoginStatus(facebookLoginStatus);

		App.on(u.LOG_IN, login);
		App.on(u.LOG_OUT, logout);
		App.on(u.FETCH_FAVORITES, fetchFavorites);
		App.on(u.FETCH_RECORDINGS, fetchRecordings);

		return this;

	};

	function finalize() {

		// unsubscribe from FB notifications
		FB.Event.unsubscribe('auth.statusChange', facebookLoginStatus);

		// let go all the event handlers
		App.off(u.LOG_IN, login);
		App.off(u.LOG_OUT, logout);
		App.off(u.FETCH_FAVORITES, fetchFavorites);
		App.off(u.FETCH_RECORDINGS, fetchRecordings);
	
		// unload the components
		this.components.user = UserComponent.finalize();	

		return this;
	}

/* export */

	return {
		name: name,
		initialize: initialize,
		model: UserModel
	};

});