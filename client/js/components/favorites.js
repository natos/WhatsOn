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
	'models/channel',
	'utils/dom'

], function(a, u, c, App, UserModel, ChannelModel, dom) {

	var name = 'favorites',

/* private */

		FAVORITE_PROGRAMMES = 'favorite-programmes',

		FAVORITE_CHANNELS = 'favorite-channels';


	function handleDataChanges(model) {

		var isConnectedToFacebook;

		if (!model) { model = UserModel; }

		if (typeof model === 'undefined') {
			console.log('Warning!', 'Favorites', 'No model, skip rendering');
			return;
		}

		if (model['facebook-status']) {
			isConnectedToFacebook = (model['facebook-status']['status'] === u.CONNECTED);
			// $('#dashboard-invitation').toggle(!isConnectedToFacebook);
			// $('#top-lists').toggle(isConnectedToFacebook);
		}

		if (model[FAVORITE_PROGRAMMES]) { renderProgrames(model[FAVORITE_PROGRAMMES]); }

		if (model[FAVORITE_CHANNELS]) { renderChannels(model[FAVORITE_CHANNELS]); }

		return;

	}

	function renderChannels(channels) {

		var favoriteChannels = document.getElementById(FAVORITE_CHANNELS),
			favoriteChannelIds = [], url, channel, id;

		// for all the favorite channels
		for (url in channels) {
			channel = channels[url].data['tv_channel'];
			id = channel.url.split(a.ROOT_URL + 'channel/')[1];
			favoriteChannelIds.push(id);
		}

		if (favoriteChannelIds.length > 0) {
			favoriteChannels.className = 'loading';
			$(favoriteChannels).load('/dashboard/on-now/channels/' + favoriteChannelIds.join('|'), function(data, status, xhr){
				favoriteChannels.className = '';
				data = null;
				delete data;
			});
		} else {
			favoriteChannels.innerHTML = document.getElementById('empty-favorite-channels-template').innerHTML;
		}
	}

	// iterate the favorites, for each of them
	// fetch the now and next, and shows
	// only the programmes with next information
	function renderProgrames(programmes) {

		var favoriteProgrammes = document.getElementById(FAVORITE_PROGRAMMES),
			favoriteProgrammeIds = [], url, programmes, id;

		// for all the favorite channels
		for (url in programmes) {
			programme = programmes[url].data['tv_show'];
			id = programme.url.split(a.ROOT_URL + 'programme/')[1];
			favoriteProgrammeIds.push(id);
		}

		if (favoriteProgrammeIds.length > 0) {
			favoriteProgrammes.className = 'loading';
			$(favoriteProgrammes).load('/dashboard/on-now/programmes/' + favoriteProgrammeIds.join('|'), function(data, status, xhr) {
				favoriteProgrammes.className = '';
				data = null;
				delete data;
			});
		} else {
			favoriteProgrammes.innerHTML = document.getElementById('favorite-programmes-notfound-template').innerHTML;
		}
	}

/* public */

	function initialize() {

		// subscribe to get re-render favorites
		App.on(u.MODEL_CHANGED, handleDataChanges);

		return this;

	}

	function render(model) {

		handleDataChanges(UserModel);

		// TODO: 	Define messages for each state
		//			when user is logged show his favorites
		//			if is logged but doesn't have any, offer to add some
		//			is is not logged in, try to explain the feature

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