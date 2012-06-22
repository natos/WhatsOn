/* 
* ProgrammeView
* --------------
*
* Controlls programme page
*
*/
define([
	
	'config/app',
	'config/user',
	'config/programme',
	'modules/app',
	'models/user',
	'lib/flaco/view',
	'components/social'

], function ProgrammeViewScope(a, u, p, App, UserModel, View, Social) {

	var name = 'programme',

/* private */

	id, url;

	/* State handler */
	function handleUserModelChanges(changes) {

		if (typeof changes === 'undefined') { return; }

		if (changes.favorites) { checkIfThisIsAFavorite(changes.favorites); }

	}

	/* State changes */
	/* check if this programme is a favorite */
	function checkIfThisIsAFavorite(favorites) {
		var found = false, favorite, programme, t = favorites.data.length;
		while (t--) {
			favorite = favorites.data[t];
			programme = favorite.data.tv_show;

			if (programme && programme.url === url) {
				found = true;
				console.log('found a favorite');
				thisIsAFavorite(favorite);
				break;
			}
		}

		if (!found) {
			console.log('didnt found a favorite');
			thisIsNotLonguerAFavorite();
		}
	}

	function thisIsAFavorite(favorite) {
		$('.favorite').attr('disable','disable').addClass('disable').data('favorite-id', favorite.id);
		$('.favorite i').attr('class','icon-star');
	}

	function thisIsNotLonguerAFavorite() {
		$('.favorite').removeAttr('disable').removeClass('disable').removeAttr('data-favorite-id');
		$('.favorite i').attr('class','icon-star-empty');
	}

	/* Action Handler, for User Interaction */
	function userActionHandler(event) {

		// the only available actions are:
		// - add to favorite
		// - remove from favorites

	/* Find a button */

		var button = event.target, $button = $(button), isDisabled, favoriteId, share;

		// so, grab a parent element
		while (button.tagName !== "BUTTON") {
			// if we reach the top container, break
			// in this case should be the #programme-content
			if (button === this) { return; }
			// step up in the DOM to the next parent
			button = button.parentNode;
		}

		// wrap it
		$button = $(button);
		// the button is disabled
		isDisabled = $button.hasClass('disable');


	/* Define the action */

		action = $button.pluck('className')[0];

		switch (action) {

			case 'like':
				App.emit(p.ADD_LIKE, url);
				break;

			case 'like disable':
				App.emit(p.REMOVE_LIKE, url);
				break;

			case 'favorite':
				App.emit(p.ADD_FAVORITE, url);
				thisIsAFavorite(id); // change de UI
				break;

			case 'favorite disable':
				// check if is already a favorite
				favoriteId = $button.data('favorite-id');
				App.emit(p.REMOVE_FAVORITE, favoriteId);
				thisIsNotLonguerAFavorite();
				break;

			case 'share':
				var share = { 
					method	: 'feed', 
					link	: url,
					name	: 'Share in your timeline',
					caption: 'Reference Documentation',
					description: 'Using Dialogs to interact with users.'
				};
				App.emit(p.SHARE, share);
				break

		}

		return;

	}

	/* ACTIONS */

	function record() {

		App.emit(p.RECORD, url);

	}

	function addFavorite() {

		App.emit(p.ADD_FAVORITE, url);

	}

	function removeFavorite(id) {

		App.emit(p.REMOVE_FAVORITE, id);

	};

/* public */

	var components = {
		social: Social
	};

/* abstract */

	function initialize(State) {

		console.log(State);
		// uncomment next line for production
		//url = State.url;
		// on dev, we need to hardcode the production url
		// to trick facebook open graph

		//App.on(u.MODEL_CHANGED, handleUserModelChanges);
	
	}

	function render() {

		console.log('rendering programme view');
		
		//p.$userAction = $('#programme-content').on('click', userActionHandler);

		//handleUserModelChanges(UserModel);
	}

	function finalize() {

		//p.$userAction.off('click', userActionHandler);

		//App.off(u.MODEL_CHANGED, handleUserModelChanges);

	}

/* export */
	
	return new View({
		name		: name,
		initialize	: initialize,
		finalize	: finalize,
		render		: render,
		components	: components
	});

});