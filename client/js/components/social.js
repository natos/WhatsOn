/*
* SocialComponent
* ---------------
*/

define([

	'config/app',
	'config/user',
	'modules/app',
	'models/user',
	'utils/dom'

], function SocialComponentScope(a, u, App, UserModel, dom) {

	var name = 'social',

/* private */

	// metadata

	url,

	type,

	// constant

	FAVORITE_PROGRAMMES = 'favorite-programmes',

	FAVORITE_CHANNELS	= 'favorite-channels',

	FAVORITE_COLLECTION,

	// DOM access

	_social,

	_favorite,

	_content = document.getElementById('content'),

	// Template

	_template = dom.create('div');
	_template.id = name;
	_template.innerHTML = document.getElementById(name + '-template').innerHTML;

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
		var i = 0, t = _favorite.length;
		for (i; i < t; i += 1) {
			_favorite[i].className = 'favorite disable';
			_favorite[i].setAttribute('disable', 'disable');
			_favorite[i].setAttribute('data-favorite-id', favorite.id);
			_favorite[i].getElementsByTagName('i')[0].className = 'icon-star';
		}
	}

	function thisIsNotLonguerAFavorite() {
		console.log('didn\'t found a favorite');
		var i = 0, t = _favorite.length;
		for (i; i < t; i += 1) {
			_favorite[i].className = 'favorite';
			_favorite[i].removeAttribute('disable');
			_favorite[i].removeAttribute('data-favorite-id');
			_favorite[i].getElementsByTagName('i')[0].className = 'icon-star-empty';
		}
		//$('.favorite', '#content').removeAttr('disable').removeClass('disable').removeAttr('data-favorite-id');
		//$('.favorite i', '#content').attr('class','icon-star-empty');
	}

	/* Action Handler, for User Interaction */
	function userActionHandler(event) {

		if (!url) { 
			console.log('Social component', 'No URL defined, can\'t work like that!');
			return; 
		}

	/* Find a button */

		var button = event.target, favoriteId, share;

		// so, grab a parent element
		while (button.tagName !== "BUTTON") {
			// if we reach the top container, break
			// in this case should be the #content
			if (button === this) { return; }
			// step up in the DOM to the next parent
			button = button.parentNode;
		}

	/* Handle different actions */

		switch (button.className) {

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
				favoriteId = button.getAttribute('data-favorite-id');
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

		// get the component
		_social = document.getElementById('social');
		// check if necessary render template
		if (!_social) { _content.getElementsByTagName('header')[0].appendChild(_template); }
		// grab favorite buttons
		_favorite = _content.querySelectorAll('.favorite');
		// listent for user behavior
		_content.addEventListener('click', userActionHandler, false);
		// force checks
		handleModelChanges(UserModel);
	}

	function finalize() {
		// remove the buttons
		_social = document.getElementById('social');
		_social.parentNode.removeChild(_social);
		_content.removeEventListener('click', userActionHandler, false);
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