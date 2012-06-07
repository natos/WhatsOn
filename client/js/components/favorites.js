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

	var template_name = '#' + name + '-template';

	function handleModelChanges(changes) {
		// check if favorites has changed
		if (changes.favorites) {
			render(changes); 
		}
	};

/* public */

	function initialize() {

		// subscribe to get re-render favorites
		App.on(u.MODEL_CHANGED, handleModelChanges);

	};

	function render(model) {

		if (!model) {
			if (!UserModel.favorites) {
				console.log('Favorites: No model, skip rendering');
				return;
			} else {
				model = UserModel;
			}
		}

		console.log('Favorites: Rendering');

		$('#top-lists').html( $(template_name).text() );

		// the argument 'model' is a reference to the UserModel
		// to ways to get here, one is trought the handleModelChanges function
		// other is directly 
		var favorites = model.favorites,
			// detach list from DOM
			list = $('.favorites ul').empty().remove(),
			item = $('<li></li>'),
			link = $('<a class="programme">');

		$(favorites.data).each(function(i, e) {

			var id = e.data.tv_show.url.match(/\d+/),
				req = '/programme/' + id + '/events.json?callback=?';

			// render item inside list
			var fav = link
				.clone() // new link
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
		list.appendTo('.favorites');

	};

	function finalize() {
		App.off(u.MODEL_CHANGED, handleModelChanges);
	};

/* export */

	return {
		name: name,
		initialize: initialize,
		finalize: finalize,
		render: render
	};

});