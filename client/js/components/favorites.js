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

	template_name = '#' + name + '-template',

	FAVORITE_PROGRAMMES = 'favorite-programmes',

	FAVORITE_CHANNELS = 'favorite-channels',

	$list_item = $('<li>'),

	$anchor = $('<a>'),

	$channel_list,

	$programme_list;

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

		if (!model) { model = UserModel; }

		if (typeof model === 'undefined') {
			console.log('Warning!', 'Favorites', 'No model, skip rendering');
			return;
		}

		if (model[FAVORITE_PROGRAMMES]) { renderProgrames(model[FAVORITE_PROGRAMMES]); }

		if (model[FAVORITE_CHANNELS]) { renderChannels(model[FAVORITE_CHANNELS]); }

		return;

	}

	function renderChannels(channels) {

		var url, channel, id,
			$a,	$li, $parent, $list = $('.favorites .channels');
			// save the list container
			$parent = $list.parent();
			// remove the list from DOM
			$list.remove();

		// for all the favorite channels
		for (url in channels) {
			channel = channels[url].data['tv_channel'];
			id = channel.url.match(/\d+\w+/)[0];
			// create a new anchor
			$a = $anchor
					.clone()
					.attr('href', '/channel/' + id)
					.attr('class', 'channel')
					.html(find_me_a_logo(id));
			// create a list item, append it to the list
			$li = $list_item.clone().append($a).appendTo($list);
		}

		// add the list to the DOM
		$list.appendTo($parent);
		// remove the loading
		$parent.removeClass('loading');
	}

	// iterate the favorites, for each of them
	// fetch the now and next, and shows
	// only the programmes with next information
	function renderProgrames(programmes) {		

		var url, programme, id, map = {}, query = [],
			$a,	$li, $parent, $list = $('.favorites .programmes');
			// save the list container
			$parent = $list.parent();
			// remove the list from DOM
			$list.remove();

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

		// get the now and next for favorite programmes
		$.getJSON('/programme/' + query.join('-') + '/next.json', function(response) {
			for (var eventTime in response) {
				var _id = response[eventTime].programme.id;
				map[_id].prepend('<span>' + response[eventTime].prettyDate + '</span>').appendTo($list);
			}
			// add the list to the DOM
			$list.appendTo($parent);
			// remove the loading
			$parent.removeClass('loading');
		});
	}

/* public */

	function initialize() {

		// subscribe to get re-render favorites
		App.on(u.MODEL_CHANGED, handleDataChanges);

		return this;

	}

	function render(model) {

		// load template
		$('#top-lists').html( $(template_name).text() );

		handleDataChanges(UserModel);

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