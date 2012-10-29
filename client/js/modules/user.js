/*
* UserModule
* ----------
*
* Control user preferences
*
*/
define([

	'config/user',
	'config/channel',
	'modules/app',
	'modules/event',
	'models/user',
	'models/channel',
	'components/user'

], function UserModuleScope(u, c, App, Event, UserModel, ChannelModel, UserComponent) {

	var name = 'user',

	// shortcuts
	slice = Array.prototype.slice,

/* private */

	// constants
	FACEBOOK_STATUS		= 'facebook-status',
	AUTH_STATUS_CHANGE	= 'auth.statusChange',
	OPEN_GRAPH_PREFIX	= '/me/upcsocial:',

	// og calls
	LIKES_CALL			= '/me/likes',
	FAVORITES_CALL		= OPEN_GRAPH_PREFIX + 'favorite',
	RECORDINGS_CALL		= OPEN_GRAPH_PREFIX + 'record',

	// labels
	LIKES				= 'likes',
	FAVORITES			= 'favorites',
	RECORDINGS			= 'recordings',
	FAVORITE_PROGRAMMES = 'favorite-programmes',
	FAVORITE_CHANNELS	= 'favorite-channels',

	// Patterns for parsing our OG urls
	OG_REGEX_PATTERN_PROGRAMME = /^http\:\/\/upcsocial\.herokuapp\.com\/programme\/(\d*)$/,
	OG_REGEX_PATTERN_CHANNEL = /^http\:\/\/upcsocial\.herokuapp\.com\/channel\/([a-zA-Z0-9]*)$/;

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

	/* actions when user is connected */
	function connected() {
		// when a user is identificated
		// fetch relevant data from OG
		fetchLikes();
		fetchFavorites();
//		fetchRecordings();
		// let know eveyone
		Event.emit(u.LOGGED_IN);

	}

	/* actions when user is disconnected */
	function disconnected() {
		// let know eveyone
		Event.emit(u.LOGGED_OUT);
		// reset the UserModel by removing data
		UserModel.set(FACEBOOK_STATUS, false);
		UserModel.set(FAVORITES, false);
		UserModel.set(FAVORITE_PROGRAMMES, false);
		UserModel.set(FAVORITE_CHANNELS, false);
//		UserModel.set(RECORDINGS, false);
		// Remove favorites?
		ChannelModel[c.GROUPS]['001'].length = 0;
	}

	/**
	*	Login and Logout actions
	*	Helpers to execute login with facebook credentials
	*/

	function login() {

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

	function logout() { FB.logout(function handleLogout(response) { /* cri-cri */ }); }

	function getAuthStatus() { return UserModel[FACEBOOK_STATUS]? true: false;	}

	/**
	*	Fetch opengraph data and save the response into a model,
	*	use:
	*		fetch( label ).from( opengraph_url ).saveTo( model );
	*/

	function fetch(label) {

		/* currying scope */
		var _label = label, _call, _model, _callback;

			/* currying helpers */
			function from(call) {
				_call = call;
				return { saveTo: saveTo };
			}

			function saveTo(model) {
				_model = model;
				return { process: process };
			}

			function process(callback) {
				_callback = callback;
				if (_label && _call && _model) { FB.api(_call, handleResponse); }
			}

		/* handler */
		function handleResponse(response) {
			if (!response) {
				console.log('Warning!', _label, _call, _model.name, ': Open graph has sent an empty response', response);
				return;
			}

			if (_callback) {
				_callback({
					label: _label,
					call: _call,
					model: _model,
					callback: _callback,
					response: response
				});
				return;
			}

			_model.set(_label, response);
		}

		/* curryout */
		return { from: from };
	}

	/* FETCH LIKES */
	function fetchLikes() {
		fetch(LIKES)
		.from(LIKES_CALL)
		.saveTo(UserModel)
		.process();
	}

	/* FETCH FAVORITES */
	function fetchFavorites() {
		fetch(FAVORITES)
		.from(FAVORITES_CALL)
		.saveTo(UserModel)
		.process(function (obj) {

			// save favorites
			obj.model.set(obj.label, obj.response);

			var TV_PROGRAMME = 'tv_show',
				TV_CHANNEL = 'tv_channel',
				favoriteProgrammeIds = [],
				favoriteChannelIds = [],
				favoritesCount = obj.response.data.length,
				i, favorite, id;

			for (i=0; i<favoritesCount; i++) {
				favorite = obj.response.data[i];

				// Details of the OG object being referenced are in the .data property of the favourite.
				// We are interested in "tv_show" and "tv_channel" objects.
				// Note that these objects are identified by a URI! We have to extract
				// our channel ID or programme ID from that URI.

				if (favorite.data[TV_PROGRAMME] && favorite.data[TV_PROGRAMME].url) {
					id = getProgrammeIdFromOpenGraphUrl(favorite.data[TV_PROGRAMME].url);
					if (id) {
						favoriteProgrammeIds.push(id);
					}
				}

				if (favorite.data[TV_CHANNEL] && favorite.data[TV_CHANNEL].url) {
					id = getChannelIdFromOpenGraphUrl(favorite.data[TV_CHANNEL].url);
					if (id) {
						favoriteChannelIds.push(id);
					}
				}

			}

			obj.model.set(FAVORITE_PROGRAMMES, favoriteProgrammeIds);
			obj.model.set(FAVORITE_CHANNELS, favoriteChannelIds);

			// GC
			programmes = null;
			channels = null;
			delete programmes;
			delete channels;

		});
	}

	function getProgrammeIdFromOpenGraphUrl(url) {
		var programmeId = null;
		var matches = url.match(OG_REGEX_PATTERN_PROGRAMME);

		if (matches.length === 2) {
			// First item in matches array contains the full pattern.
			// programme ID capture group is in second position.
			programmeId = matches[1];
		}

		return programmeId;
	}

	function getChannelIdFromOpenGraphUrl(url) {
		var channelId = null;
		var matches = url.match(OG_REGEX_PATTERN_CHANNEL);

		if (matches.length === 2) {
			// First item in matches array contains the full pattern.
			// channel ID capture group is in second position.
			channelId = 's-' + matches[1];
		}

		return channelId;
	}

	/* FETCH RECORDINGS */
	function fetchRecordings() {
		fetch(RECORDINGS)
		.from(RECORDINGS_CALL)
		.saveTo(UserModel)
		.process();
	}

	/*
	* Social actions
	*/

	function share(obj) {

		if (!getAuthStatus()) { 
			// emit login with a callback, cool eh? :)
			login(function afterLogin() { share(obj); });
			return; 
		}

		FB.ui(obj, function(response) {

			if (!response || response.error) {
				console.log('Error occured trying to share on the wall', response);
				return;
			}

			console.log('Shared', response);

		});

	}

	function addFavorite(type, url) {

		// Problems to solve here…
		// TODO: What if an unknown user, want to add a favorite, that already have?

		// When user is not logued in, get its credentials and delay the action
		if (!getAuthStatus()) { 
			login(function afterLogin() { addFavorite(type, url); });
			return; 
		}

		type = type.split('upcsocial:').join('');

		var _favorite = {};
			_favorite[type] = url;

		// TODO: Check if Favorite already exist!!!
		// if (favorite_already_exist) {
		// 		return;
		// }

		// post the new favorite show to open graph
		FB.api('/me/upcsocial:favorite', 'post', _favorite, function handleAddFavoriteResponse(response) {

			if (!response || response.error) {
				console.log('Error occured trying to add a new favorite', response);
				return;
			} 

			console.log('Favorite was added', response);
			// TODO: Update the model, avoid fetching favorites
			fetchFavorites();
		});
	}

	function removeFavorite(id) {

		// Not sure if this use case is necessary, I don't think an unknown user
		// would be able to remove a favorite, because he don't have any.
		

		// When user is not logued in, get its credentials and delay the action
		if (!getAuthStatus()) { 
			login(function afterLogin() { removeFavorite(id); });
			return; 
		}

		// delete node from open graph
		FB.api(id, 'delete', function handleRemoveFavoriteResponse(response) {

			if (!response || response.error) {
				console.log('Error occured trying to remove favorite', response);
				return;
			}

			console.log('Favorite was deleted');
			// TODO: Update the model, avoid fetching favorites
			fetchFavorites();
		});

	}

	/*
	* End Social actions
	*/

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

		// Listen for changes on Facebook login status
		FB.Event.subscribe(AUTH_STATUS_CHANGE, facebookLoginStatus);

		// FB init
		FB.init({ 
			appId		: u.APP_ID,
			status		: true, // The user's login status will automatically be checked
			cookie		: true,
			xfbml		: true
		});

		this.components = {
			user: UserComponent.initialize()
		};

		Event.on(u.LOG_IN, login);
		Event.on(u.LOG_OUT, logout);

		Event.on(u.FETCH_LIKES, fetchLikes);
		Event.on(u.FETCH_FAVORITES, fetchFavorites);
		Event.on(u.FETCH_RECORDINGS, fetchRecordings);

		Event.on(u.SHARE, share);
		Event.on(u.ADD_FAVORITE, addFavorite);
		Event.on(u.REMOVE_FAVORITE, removeFavorite);

		return this;
	}

	function finalize() {
		// unsubscribe from FB notifications
		FB.Event.unsubscribe(AUTH_STATUS_CHANGE, facebookLoginStatus);

		// let go all the event handlers
		Event.off(u.LOG_IN, login);
		Event.off(u.LOG_OUT, logout);

		Event.off(u.FETCH_LIKES, fetchLikes);
		Event.off(u.FETCH_FAVORITES, fetchFavorites);
		Event.off(u.FETCH_RECORDINGS, fetchRecordings);

		Event.off(u.SHARE, share);
		Event.off(u.ADD_FAVORITE, addFavorite);
		Event.off(u.REMOVE_FAVORITE, removeFavorite);

		// unload the components
		this.components.user = UserComponent.finalize();	

		return this;
	}

/* export */

	return {
		name			: name,
		initialize		: initialize,
		model			: UserModel
	};

});