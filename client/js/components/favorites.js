/*
* FavoritesComponent
* -----------------
*/

define([

	'config/app',
	'config/user',
	'config/channel',
	'modules/app',
	'models/user',
	'models/channel'

], function(a, u, c, App, UserModel, ChannelModel) {

	var name = 'favorites',

/* private */

		FAVORITE_PROGRAMMES = 'favorite-programmes',

		FAVORITE_CHANNELS = 'favorite-channels',

		$list_item = $('<li>'),

		$anchor = $('<a>');

	// TODO: Update new aproach to get logos
	function find_me_a_logo(id) {
		var logo = false, channels = ChannelModel[c.DATA];
		for (var i = 0; i < channels.length; i++) {
			var _channel = channels[i];
			if (_channel.id === id) {
				logo = _channel.logoIMG; break;
			}
		}
		return (logo) ? '<img src="http://www.upc.nl/' + logo + '">' : false ;
	}

	function handleDataChanges(model) {
		var isConnectedToFacebook;

		if (!model) { model = UserModel; }

		if (typeof model === 'undefined') {
			console.log('Warning!', 'Favorites', 'No model, skip rendering');
			return;
		}

		if (model['facebook-status']) {
			isConnectedToFacebook = (model['facebook-status']['status'] === u.CONNECTED);
			$('#dashboard-invitation').toggle(!isConnectedToFacebook);
			$('#top-lists').toggle(isConnectedToFacebook);
		}

		if (model[FAVORITE_PROGRAMMES]) { renderProgrames(model[FAVORITE_PROGRAMMES]); }

		if (model[FAVORITE_CHANNELS]) { renderChannels(model[FAVORITE_CHANNELS]); }

		return;

	}

	function renderChannels(channels) {

		var url, channel, id;
		var $favoriteChannels = $('.favorite-channels');
		var favoriteChannelIds = [];

		// for all the favorite channels
		for (url in channels) {
			channel = channels[url].data['tv_channel'];
			id = channel.url.match(/\d+\w+/)[0];
			favoriteChannelIds.push(id);
		}

		if (favoriteChannelIds.length > 0) {
			$favoriteChannels
				.addClass('loading')
				.load('/dashboard/on-now/' + favoriteChannelIds.join('|'), function(data, status, xhr){
					$favoriteChannels.removeClass('loading');
				});
		} else {
			$favoriteChannels.html($('#empty-favorite-channels-template').text());
		}
	}

	// iterate the favorites, for each of them
	// fetch the now and next, and shows
	// only the programmes with next information
	function renderProgrames(programmes) {

		var url, programme, id, map = {}, query = [],
			$a,	$li, $list;
		var $favoriteProgrammes = $('.favorite-programmes');

		// for all the favorite channels
		for (url in programmes) {
			programme = programmes[url].data['tv_show'];
			id = programme.url.match(/\d+\w+/)[0];
			// create a new anchor
			$a = $anchor
					.clone()
					.attr('href', '/programme/' + id)
					.attr('class', 'programme')
					.html(programme.title);
			// create a list item
			$li = $list_item.clone().append($a);
			// map the guy
			map[id] = $li;
			// save the id to query nowandnext
			query.push(id);
		}

		// Get upcoming events for favorite programmes
		if (query.length > 0) {
			$favoriteProgrammes
				.addClass('loading').
				html($('#favorite-programmes-template').text());

			$list = $('.favorite-programmes .programmes');

			$.getJSON('/programme/' + query.join('-') + '/next.json', function(response, status, xhr) {
				for (var eventTime in response) {
					var _id = response[eventTime].programme.id;
					map[_id].prepend('<span>' + response[eventTime].prettyDate + '</span>').appendTo($list);
				}
				$favoriteProgrammes.removeClass('loading');

				// User has favourites, but programmes not found in EPG
				if ($list.find('li').length==0) {
					$favoriteProgrammes.html($('#favorite-programmes-notfound-template').text());
				}
			});
		} else {
			// User has no favourites
			$favoriteProgrammes.html($('#empty-favorite-programmes-template').text());
		}
	}

/* public */

	function initialize() {

		// subscribe to get re-render favorites
		App.on(u.MODEL_CHANGED, handleDataChanges);

		return this;

	}

	function render(model) {

		var $topLists = $('#top-lists');
		var $dashboardInvitation = $('#dashboard-invitation');
		$topLists.hide();
		$dashboardInvitation.hide();

		handleDataChanges(UserModel);

		// In development mode, the Facebook getLoginStatus call can sometimes fail,
		// without calling its callback (see http://stackoverflow.com/questions/7522947/fb-getloginstatus-does-not-fires-callback-function)
		// If we haven't shown either the #top-lists or #dashboard-invitation
		// block after 2 seconds, assume that getLoginStatus is dead, and show the invitation block.
		setTimeout(function(){
			if ($topLists.css('display') === 'none' && $dashboardInvitation.css('display') === 'none') {
				$dashboardInvitation.show();
			}
		}, 2000);

		return this;

	}

	function finalize() {

		App.off(u.MODEL_CHANGED, handleDataChanges);

		return this;

	}

/* export */

	return {
		name		: name,
		initialize	: initialize,
		finalize	: finalize,
		render		: render
	};

});