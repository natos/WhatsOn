/* 
* ChannelView
* -----------
*
* Controlls channel page
*
*/
define([
	
	'config/app',
	'config/user',
	'config/channel',
	'modules/app',
	'lib/flaco/view'

], function ChannelViewScope(a, u, c, App, View) {

	var name = 'channel';

/* private */

	var url = $('meta[property="og:url"]').attr('content');

	/* State handler */
	function handleUserModelChanges(changes) {

		if (typeof changes === 'undefined') { return; }

		if (changes.favorites) { checkIfThisIsAFavorite(changes.favorites); }

	}

	/* State changes */
	/* check if this channel is a favorite */
	function checkIfThisIsAFavorite(favorites) {
		var found = false, favorite, channel, t = favorites.data.length;
		while (t--) {
			favorite = favorites.data[t];
			channel = favorite.data.tv_channel;
			if (channel && channel.url === url) {
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

		var button = event.target, $button = $(button), isFavorited;

		// so, grab a parent element
		while (!$button.hasClass('favorite')) {
			// if we reach the top container, break
			// in this case should be the #programme-content
			if (button === this) { break; }
			// step up in the DOM to the next parent
			button = button.parentNode;
			// wrap it
			$button = $(button);
		}

		/* nothing to do here */
		// when bubbling we reach the document
		if (button === document) { return; }
		// the button is disabled
		if ($button.hasClass('disabled')) { return; }


	/* Define the action */

		action = $button.pluck('className');

		console.log(action);

		return;

		// check if is already a favorite
		isFavorited = $button.data('favorite-id')
		if (isFavorited) {
			// then the action would be remove from favorite
			removeFavorite(isFavorited);
			return;
		}

		// default action is to add a favorite
		addFavorite(); 
		return;

	}

	/* ACTIONS */

	function addFavorite() {

		App.emit(c.ADD_FAVORITE, url);

	}

	function removeFavorite(id) {

		App.emit(c.REMOVE_FAVORITE, id);

	};

/* public */

	function initialize() {

		App.on(u.MODEL_CHANGED, handleUserModelChanges);

		return this;
	
	}


	function render() {

		c.$userAction = $('#user-action').on('click', userActionHandler);

		return this;

	}

	function finalize() {

		App.off(u.MODEL_CHANGED, handleUserModelChanges);

		return this;

	}

/* export */

	return new View({
		name		: name,
		initialize	: initialize,
		finalize	: finalize,
		render		: render
	});

});