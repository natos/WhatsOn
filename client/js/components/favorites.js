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
	}

	function find_me_a_logo(name) {
		var logo = false;
		for (var i = 0; i < channels.length; i++) {
			var _channel = channels[i];
			if (_channel.name === name) {
				logo = _channel.logoIMG; break;
			}
		}
		return (logo) ? '<img src="http://www.upc.nl/' + logo + '">' : false ;
	}

/* public */

	function initialize() {

		// subscribe to get re-render favorites
		App.on(u.MODEL_CHANGED, handleModelChanges);

	}

	function render(model) {

		/*
		*	this is a mess > refactor needed
		*/

		// grab the model
		if (!model) { model = UserModel; }
		// check for collections
		if (!model[name]) {
			console.log('Warning!', 'Favorites', 'No model, skip rendering');
			return;
		}

		// load template
		$('#top-lists').html( $(template_name).text() );

		// the argument 'model' is a reference to the UserModel
		// to ways to get here, one is trought the handleModelChanges function
		// other is by a direct call
		var favorites = model[name],
			// DOM elements
			$favorites = $('.' + name),
			// detach lists from DOM
			$lists = {
				'programme'	: $favorites.find('.programmes'),
				'channel'	: $favorites.find('.channels')
			},
			$listitem = $('<li></li>'),
			$link = $('<a>');

		$(favorites.data).each(function(i, e) {

			// defining the type of favorite
			var isChannel = typeof e.data.tv_show === 'undefined',
				listname = (isChannel) ? 'channel' : 'programme',
				type = (isChannel) ? 'tv_channel' : 'tv_show',
				item = e.data[type];

			var id = item.url.match(/\d+/),
				req = '/' + listname + '/' + id + '/events.json?callback=?',
				content = item.title;

			if (isChannel) {
				content = find_me_a_logo(item.title) || item.title;
			}

			// render item inside list
			// save the reference for later
			var fav = $link
				.clone() // new link
				.attr('href', '/' + listname + '/' + id)
				.attr('class', listname)
//				.data('programmeid', id)
				.html(content)
				.appendTo(
					$listitem.clone().appendTo($lists[listname])
				);

			if (!isChannel) {
				// get NowAndNext for the favorite shows
				$.getJSON(req, function(response) {
					var event = response[0];
					if (event && event.prettyDate) {
						fav.parent().append('<span>' + event.prettyDate + '</span>');
					}
				});
			}

		// end each
		});
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