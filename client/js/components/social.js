/*
* SocialComponent
* ---------------
*/

define([

	'config/app',
	'config/user',
	'modules/app',
	'models/user'

], function SocialComponentScope(a, u, App, UserModel) {

	var name = 'social',

/* private */

	// metadata

	url,

	type,

	// constant

	FAVORITE_PROGRAMMES = 'favorite-programmes',

	FAVORITE_CHANNELS	= 'favorite-channels',

	FAVORITE_COLLECTION,

	// naming

	template_id = '#' + name + '-template',

	// DOM access

	$template = $(template_id),

	$content = $('#content'),

	$social;

	/* State handler */
	function handleModelChanges(changes) {

		if (typeof changes === 'undefined') { return; }

		if (changes[FAVORITE_COLLECTION]) { checkIfIsFavorite(changes); }

	}

	/* State changes */
	/* check if this programme is a favorite */

	function checkIfIsFavorite(changes) {

		var isFavorite = changes[FAVORITE_COLLECTION] && changes[FAVORITE_COLLECTION][url];

		if (isFavorite) { thisIsAFavorite(isFavorite); } else { thisIsNotLonguerAFavorite(); }

	}

	function thisIsAFavorite(favorite) {
		console.log('found a favorite');
		$('.favorite', '#content').attr('disable','disable').addClass('disable').data('favorite-id', favorite.id);
		$('.favorite i', '#content').attr('class','icon-star');
	}

	function thisIsNotLonguerAFavorite() {
		console.log('didn\'t found a favorite');
		$('.favorite', '#content').removeAttr('disable').removeClass('disable').removeAttr('data-favorite-id');
		$('.favorite i', '#content').attr('class','icon-star-empty');
	}

	/* Action Handler, for User Interaction */
	function userActionHandler(event) {

		if (!url) { 
			console.log('Social component', 'No URL defined, can\'t work like that!');
			return; 
		}

	/* Find a button */

		var button = event.target, $button = $(button), isDisabled, favoriteId, share;

		// so, grab a parent element
		while (button.tagName !== "BUTTON") {
			// if we reach the top container, break
			// in this case should be the #content
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
				App.emit(u.ADD_LIKE, url);
				break;

			case 'like disable':
				App.emit(u.REMOVE_LIKE, url);
				break;

			case 'favorite':
				App.emit(u.ADD_FAVORITE, type, url);
				thisIsAFavorite(id); // Update UI, don't wait for the response
				break;

			case 'favorite disable':
				favoriteId = $button.data('favorite-id');
				App.emit(u.REMOVE_FAVORITE, favoriteId);
				thisIsNotLonguerAFavorite(); // Update UI, don't wait for the response
				break;

			case 'share':
				App.emit(u.SHARE, { method: 'feed', link: url });
				break;
		}

		return;

	}

/* public */

	function initialize(State) {

		// subscribe to get favorites
		App.on(u.MODEL_CHANGED, handleModelChanges);
		// save basic data for this favorite
		id = State.parts[0];
		// hardcoded here to emulate producction urls for facebook
		url = 'http://upcsocial.herokuapp.com' + State.hash.split('?')[0];
		type = /programme/.test(State.url) ? 'tv_show' : 'tv_channel';
		// define which collection we gonna use
		// favorite programmes or channels
		FAVORITE_COLLECTION = /programme/.test(State.url) ? FAVORITE_PROGRAMMES : FAVORITE_CHANNELS;

	}

	function render(model) {

		if (!$('#social')[0]) {
			// render template
			$content.find('header').first().append($template.html());
		}
		
		// listent for user behavior
		$social = $('#social');
		$content.on('click', userActionHandler);
		// force checks
		handleModelChanges(UserModel);

	}

	function finalize() {

		// remove the buttons
		$social.remove();
		$content.off('click', userActionHandler);
		// remove model handler
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