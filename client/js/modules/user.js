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

], function UserModuleScope(u, App, UserModel, UserComponent) {

	var name = 'user',

	// shorcuts
		slice = Array.prototype.slice;

/* private */

	// constants
	FACEBOOK_STATUS		= 'facebook-status',
	AUTH_STATUS_CHANGE	= 'auth.statusChange',
	OPEN_GRAPH_PREFIX	= '/me/upcsocial:',
	// og calls
	FAVORITES_CALL		= OPEN_GRAPH_PREFIX + 'favorite',
	RECORDINGS_CALL		= OPEN_GRAPH_PREFIX + 'record',
	// labels
	FAVORITES			= 'favorites',
	RECORDINGS			= 'recordings';

	// every time the facebook login status
	// is changed, this handler will save the
	// response in the UserModel and trigger
	// some events to let know everyone what
	// just happend
	function facebookLoginStatus(response) {

		UserModel.set(FACEBOOK_STATUS, response);

		switch (response.status) {
			case u.CONNECTED: 
				connected(); 
				break;

			case u.NOT_AUTHORIZED:
			case u.UNKNOWN:
				disconnected();
				break;
		}

	}

	/**
	*	Login and Logout actions
	*	Helpers to execute login with facebook credentials
	*/

	function login() { 
console.log('Login in')
		// Check for arguments. The first argument, could be a callback
		// Because some actions need login first
		var args = slice.call(arguments, 0), callback = args.shift();

		// Handle the response of login
		function handleLogin(response) {
			// error handling
			if (response && response.error) {
				console.log('Error on UserModule', 'Can\'t login', response);
				return;
			}
			// if there's any callback there, just call him
			if (typeof callback === 'function') { callback(args); }
		}

		// Login with facebook
		FB.login(handleLogin, { scope: u.SCOPE }); 

	}

	function logout() { FB.logout(function handleLogout(response) { /* cri-cri() */ }); }

	/**
	*	Fetch opengraph data and save the response into a model, 
	*	use: 
	*		fetch( label ).from( opengraph_url ).saveTo( model );
	*/

	function fetch(label) {

		/* currying scope */
		var _label = label, _call, _model;

		/* currying helpers */
		function from(call) {

			_call = call;

			/* curryout */
			return { saveTo: saveTo };
		}

		function saveTo(model) {

			_model = model;

			if (_label && _call && _model) {
				// make the call
				FB.api(_call, handleResponse);
			}

			/* curryrestart */
			return { fetch: this };
		}

		/* handler */
		function handleResponse(response) {

			if (!response) { 
				console.log('Warning!', _label, _call, _model.name, ': Open graph has sent an empty response');
				return; 
			}

			_model.set(_label, response);
		}

		/* curryout */
		return { from: from };
	}

	/* FAVORITES */

	function fetchFavorites() {

		//FB.api(FAVORITES_CALL, setFavorites);
		fetch(FAVORITES).from(FAVORITES_CALL).saveTo(UserModel);
	}

	/* RECORDINGS */

	function fetchRecordings() {

		//FB.api(RECORDINGS_CALL, setRecordings);
		fetch(RECORDINGS).from(RECORDINGS_CALL).saveTo(UserModel);
	}

	/* actions when user is connected */
	function connected() {
		// when a user is identificated
		// fetch relevant data from OG
		App.emit(u.FETCH_FAVORITES);
		App.emit(u.FETCH_RECORDINGS);
		// let know eveyone
		App.emit(u.LOGGED_IN);

	}

	/* actions when user is disconnected */
	function disconnected() {
		// let know eveyone
		App.emit(u.LOGGED_OUT);
		// reset the UserModel by removing data
		UserModel.set(FACEBOOK_STATUS, false);
		UserModel.set(FAVORITES, false);
		UserModel.set(RECORDINGS, false);
	}


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
		}

		// FB init
		FB.init({ 
			appId		: u.APP_ID,
			status		: true,
			cookie		: true,
			xfbml		: true
		});

		// Lisent for changes on Facebook login status
		FB.Event.subscribe(AUTH_STATUS_CHANGE, facebookLoginStatus);

		this.components = {
			user: UserComponent.initialize()
		};

		// Check Facebook login status
		//FB.getLoginStatus(facebookLoginStatus);

		App.on(u.LOG_IN, login);
		App.on(u.LOG_OUT, logout);
		App.on(u.FETCH_FAVORITES, fetchFavorites);
		App.on(u.FETCH_RECORDINGS, fetchRecordings);

		return this;

	}

	function finalize() {

		// unsubscribe from FB notifications
		FB.Event.unsubscribe(AUTH_STATUS_CHANGE, facebookLoginStatus);

		// let go all the event handlers
		App.off(u.LOG_IN, login);
		App.off(u.LOG_OUT, logout);
		App.off(u.FETCH_FAVORITES, fetchFavorites);
		App.off(u.FETCH_RECORDINGS, fetchRecordings);
	
		// unload the components
		this.components.user = UserComponent.finalize();	

		return this;
	}

	function getAuthStatus() {

		return UserModel[FACEBOOK_STATUS]? true: false;

	}

/* export */

	return {
		name			: name,
		initialize		: initialize,
		getAuthStatus	: getAuthStatus,
		model			: UserModel
	};

});