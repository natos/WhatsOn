/* 
* ProgrammeController
* ------------------
*
*/

define([

	'config/app',
	'config/user',
	'config/programme',
	'modules/app',
	'modules/User',
	'lib/flaco/controller',
	'views/programme'

], function ProgrammeControllerScope(a, u, p, App, User, Controller, ProgrammeView) {


	var name = 'programme';

/* private */

	/* maybe try some DRY here */

	function share(obj) {

		if (!User.getAuthStatus()) { 
			// emit login with a callback, cool eh? :)
			App.emit(u.LOG_IN, function() {
				// delayed action
				share(url); 
			});
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
		FB.api('/me/upcsocial:favorite', 'post', { tv_show: url }, function handleAddFavoriteResponse(response) {

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

	function initialize(State) {

		App.on(p.SHARE, share);
		App.on(p.ADD_FAVORITE, addFavorite);
		App.on(p.REMOVE_FAVORITE, removeFavorite);
		
		return this;
	
	}

	function finalize() {

		App.off(p.SHARE, share);
		App.off(p.ADD_FAVORITE, addFavorite);
		App.off(p.REMOVE_FAVORITE, removeFavorite);

		return this;

	}

/* export */

	return new Controller({
		name		: name,
		initialize	: initialize,
		finalize	: finalize,
		view		: ProgrammeView
	});

});