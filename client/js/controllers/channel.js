/* 
* ChannelController
* ------------------
*
*/

define([

	'config/app',
	'config/user',
	'config/channel',
	'modules/app',
	'modules/user',
	'lib/flaco/controller',
	'views/channel'

], function ChannelControllerScope(a, u, c, App, User, Controller, ChannelView) {

	var name = 'channel';

/* private */

	/* maybe try some DRY here */

	function addFavorite(url) {

		// Problems to solve here…
		// TODO: What if an unknown user, want to add a favorite, that already have?

		// When user is not logued in, get its credentials and delay the action
		if (!User.getAuthStatus()) { 
			// emit login with a callback, cool eh? :)
			// this will be prompting a facebook login and when the users is logged, will trigger the callback
			App.emit(u.LOG_IN, function addFavoriteCallback() { 
				// lazy action
				addFavorite(url); 
			});
			return; 
		}

		// post the new favorite show to open graph
		FB.api('/me/upcsocial:favorite', 'post', { tv_channel: url }, function handleAddFavoriteResponse(response) {

			if (!response || response.error) {
				console.log('Error occured trying to add a new favorite', response);
				return;
			} 

			console.log('Favorite was added', response);
			App.emit(u.FETCH_FAVORITES);
		});
	}

	function removeFavorite(id) {

		// Not sure if this use case is necessary, I don't think an unknown user
		// would be able to remove a favorite, because he don't have any.
		// When user is not logued in, get its credentials and delay the action
		if (!User.getAuthStatus()) { 
			// emit login with a callback, cool eh? :)
			// this will be prompting a facebook login and when the users is logged, will trigger the callback
			App.emit(u.LOG_IN, function removeFavoriteCallback() { 
				// 				// lazy action action
				removeFavorite(url); 
			});
			return; 
		}

		// delete node from open graph
		FB.api(id, 'delete', function handleRemoveFavoriteResponse(response) {

			if (!response || response.error) {
				console.log('Error occured trying to remove favorite', response);
				return;
			}

			console.log('Favorite was deleted');
			App.emit(u.FETCH_FAVORITES);
		});

	}


/* public */

/* abstract */

	function initialize() {

		App.on(c.ADD_FAVORITE, addFavorite);
		App.on(c.REMOVE_FAVORITE, removeFavorite);

		return this;

	}

	function finalize() {

		App.off(c.ADD_FAVORITE, addFavorite);
		App.off(c.REMOVE_FAVORITE, removeFavorite);

		return this;

	}


/* export */

	return new Controller({
		name		: name,
		initialize	: initialize,
		finalize	: finalize,
		view		: ChannelView
	});

});