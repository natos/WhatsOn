/*
* SocialComponent
* ---------------
*/

define([

	'config/app',
	'config/user',
	'modules/app',
	'modules/event',
	'models/user',
	'utils/dom'

], function SocialComponentScope(a, u, App, Event, UserModel, dom) {

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
	
	_layout,

	_favoriteButton = createButton({ label: 'Favorite', klass: 'favorite', icon: 'icon-star-empty' }),
	
	_shareButton = createButton({ label: 'Share', klass: 'share', icon: 'icon-share' });

	/* dom helpers */

	function createButton(options) {

		var button, label, icon;

			icon = dom.element('i', { klass: options.icon });

			label = dom.element('b');
			label.appendChild(dom.text(options.label));

			button = dom.element('button', { klass: options.klass });
			button.appendChild(icon);
			button.appendChild(label);

		return button;

	}

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
		_favoriteButton.klassName = 'favorite disable';
		_favoriteButton.setAttribute('disable', 'disable');
		_favoriteButton.setAttribute('data-favorite-id', favorite.id);
		_favoriteButton.getElementsByTagName('i')[0].klassName = 'icon-star';
	}

	function thisIsNotLonguerAFavorite() {		
		_favoriteButton.klassName = 'favorite';
		_favoriteButton.removeAttribute('disable');
		_favoriteButton.removeAttribute('data-favorite-id');
		_favoriteButton.getElementsByTagName('i')[0].klassName = 'icon-star-empty';
	}

	/* Action Handler, for User Interaction */
	function userActionHandler(event) {

		if (!url) { 
			console.log('Social component', 'No URL defined, I can\'t work like that!');
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

		switch (button.klassName) {

			case 'like':
				Event.emit(u.ADD_LIKE, url);
				break;

			case 'like disable':
				Event.emit(u.REMOVE_LIKE, url);
				break;

			case 'favorite':
				Event.emit(u.ADD_FAVORITE, type, url);
				thisIsAFavorite(id); // Update UI, don't wait for the response
				break;

			case 'favorite disable':
				favoriteId = button.getAttribute('data-favorite-id');
				Event.emit(u.REMOVE_FAVORITE, favoriteId);
				thisIsNotLonguerAFavorite(); // Update UI, don't wait for the response
				break;

			case 'share':
				Event.emit(u.SHARE, { method: 'feed', link: url });
				break;
		}

		return;

	}

/* public */

	function initialize(State) {
		// subscribe to get favorites
		Event.on(u.MODEL_CHANGED, handleModelChanges);
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

		console.log('>>> Render')

		// create the container
		_layout = dom.element('div', { id: 'social' });
		// listent for user behavior
		_layout.addEventListener('click', userActionHandler, false);
		_layout.appendChild(_favoriteButton);
		_layout.appendChild(_shareButton);

		console.log(dom.doc.getElementById('programme-content'))
		dom.content.appendChild(_layout);

		// force checks
		handleModelChanges(UserModel);

	}

	function finalize() {
		// remove model handler
		Event.off(u.MODEL_CHANGED, handleModelChanges);
		// remove behavior event
		_layout.removeEventListener('click', userActionHandler, false);
		_layout.removeChild(_favoriteButton);
		_layout.removeChild(_shareButton);
		_layout.parentNode.removeChild(_layout);
	}

/* export */

	return {
		name		: name,
		initialize	: initialize,
		finalize	: finalize,
		render		: render
	};

});