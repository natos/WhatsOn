/*
* FavoritesComponent
* -----------------
*/

define([

	'config/app',
	'config/user',
	'modules/app',
	'models/user'

], function(a, u, App, UserModel) {

	var name = 'favorites';

/* private */

	var template = $('.top-favorites-template');

	function disarmLayout() {
		console.log('Favorites: disarmLayout');
//		var content = $('.top-favorites');
//		template.text( content.html() );
//		content.remove();
		$('.top-favorites').remove();
	}

	function prepareLayout() {
		console.log('Favorites: preparingLayout');
		$('#top-lists').append( template.text() );
		console.log(template.text());
	}

	function render(model) {

		console.log('Favorites: Rendering');

		// the argument 'model' is a reference to the UserModel
		// to ways to get here, one is trought the handleModelChanges function
		// other is directly 
		var favorites = model.favorites,
			// detach list from DOM
			list = $('.top-favorites ul').empty().remove(),
			item = $('<li></li>'),
			link = $('<a class="programme">');

		$(favorites.data).each(function(i, e) {

			var id = e.data.tv_show.url.match(/\d+/),
				req = '/programme/' + id + '/events.json?callback=?';

			// render item inside list
			var fav = link
						.clone()
						.attr('href', '/programme/' + id)
						.data('programmeid', id)
						.html(e.data.tv_show.title)
						.appendTo(
							item.clone().appendTo(list)
						);

			// get NowAndNext for the favorites
			$.getJSON(req, function(response) {
				var event = response[0];
				if (event && event.prettyDate) {
					fav.parent().prepend('<p>' + event.prettyDate + '</p>');
				}
			});
		});

		// attach list to DOM
		list.appendTo('.top-favorites');

	};

	function handleModelChanges(changes) {
		if (changes.favorites) { 
			console.log('Favorites: UserModel changed, new favorites to render.');
			render(changes); 
		}
	};

/* public */

	function initialize() {

		console.log('Favorites: initializing');

		// draw layout
		prepareLayout();

		// render favorites
		console.log('Favorites: about to render…');
		if (UserModel.favorites) { 
			console.log('Favorites: I have favorites, go!');
			render(UserModel);
		} else {
			console.log('Favorites: no data to render, just wait for an event', UserModel);
		}

		// subscribe to get re-render favorites
		App.on(u.MODEL_CHANGED, handleModelChanges);

	};

	function finalize() {
		console.log('Favorites: finalizing');

		// destroy layout
		disarmLayout();

		App.off(u.MODEL_CHANGED, handleModelChanges);
	};

/* export */

	return {
		name: name,
		initialize: initialize,
		finalize: finalize
	};

});