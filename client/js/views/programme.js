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
	'lib/flaco/view',
	'controllers/programme'

], function ProgrammeViewScope(a, u, p, App, View, ProgrammeController) {

	var name = 'programme';

/* private */

	var url = $('meta[property="og:url"]').attr('content');

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

/* abstract */

	function initialize(State) {

		App.on(u.MODEL_CHANGED, handleUserModelChanges);
	
	}

	function render() {

		p.$userAction = $('#programme-content').on('click', userActionHandler);

	}

	function finalize() {

		p.$userAction.off('click', userActionHandler);

		App.off(u.MODEL_CHANGED, handleUserModelChanges);

	}

/* export */
	
	return new View({
		name		: name,
		initialize	: initialize,
		finalize	: finalize,
		render		: render
	});

});