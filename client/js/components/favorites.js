/*
* FavoritesComponent
* -----------------
*/

define([

	'modules/zepto',
	'config/app',
	'config/user',
	'config/channel',
	'modules/app',
	'modules/event',
	'models/user',
	'models/channel',
	'utils/dom'

], function($, a, u, c, App, Event, UserModel, ChannelModel, dom) {

	var name = 'favorites',

/* private */

		// constants 

		FACEBOOK_STATUS = 'facebook-status',

		FAVORITE_PROGRAMMES = 'favorite-programmes',

		FAVORITE_CHANNELS = 'favorite-channels',

		// flags

		isConnectedToFacebook = false,

		// dom 

		_dashboardContent = document.getElementById('dashboard-content'),

		_invitation = dom.create('section');

		_invitation.id = 'invitation';

		_invitation.innerHTML = document.getElementById('invitation-template').innerHTML;


	function handleDataChanges(model) {

		if (!model) { model = UserModel; }

		if (typeof model === 'undefined') {
			console.log('Warning!', 'Favorites', 'No UserModel available, skip rendering!');
			return;
		}

		if (model[FACEBOOK_STATUS]) {

			isConnectedToFacebook = (model[FACEBOOK_STATUS]['status'] === u.CONNECTED);

			if (!isConnectedToFacebook) {
				renderInvitation();
			} else {
				removeInvitation();
			}
		}

		if (model[FAVORITE_PROGRAMMES]) { renderProgrames(model[FAVORITE_PROGRAMMES]); }

		if (model[FAVORITE_CHANNELS]) { renderChannels(model[FAVORITE_CHANNELS]); }

		return;

	}

	function renderInvitation() { 
		_dashboardContent.insertBefore(_invitation, document.getElementById('featured').nextSibling); 
	}

	function removeInvitation() { 
		var __invitation = document.getElementById('invitation');
		if (__invitation) {
			__invitation.parentNode.removeChild(__invitation);
		}
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
			console.log('Favorite channels not found man, sorry!');
		}

		console.log('finish rendering channels');
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
			console.log('Favorite progames not found man, sorry!');
		}

		console.log('finish rendering programmes');
	}

/* public */

	function initialize() {

		// subscribe to get re-render favorites
		Event.on(u.MODEL_CHANGED, handleDataChanges);

		return this;

	}

	function render(model) {

		handleDataChanges(UserModel);

		if (!isConnectedToFacebook) {
			renderInvitation();
		} else {
			removeInvitation();
		}

		return this;

	}

	function finalize() {

		removeInvitation();

		Event.off(u.MODEL_CHANGED, handleDataChanges);

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