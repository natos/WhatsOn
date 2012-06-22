/*
* SocialComponent
* ---------------
*/

define([

	'config/app',
	'config/user',
	'modules/app',
	'models/user'

], function(a, u, App, UserModel) {

	var name = 'social',

/* private */

	url = $('meta[property="og:url"]').attr('content'),

	template_id = '#' + name + '-template',

	$template = $(template_id),

	$social;

	/* State handler */
	function handleModelChanges(changes) {

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

		if (!url) { return; }

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

	function initialize(State) {

		// subscribe to get favorites
		App.on(u.MODEL_CHANGED, handleModelChanges);

		id = State.parts[0];
		url = 'http://upcsocial.herokuapp.com' + State.hash.split('?')[0];

	}

	function render(model) {

				
		$social = $('#social').on('click', userActionHandler);

	}

	function finalize() {

		App.off(u.MODEL_CHANGED, handleModelChanges);

	}

/* export */

	return {
		name		: name,
		initialize	: initialize,
		finalize	: finalize,
		render		: render
	};

});