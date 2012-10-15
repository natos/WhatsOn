/*
* FavoritesComponent
* -----------------
*/

define([

	'config/app',
	'config/user',
	'config/channel',
	'modules/app',
	'modules/event',
	'models/user',
	'models/channel',
	'utils/epgapi',
	'utils/dom'

], function(a, u, c, App, Event, UserModel, ChannelModel, EpgApi, dom) {

	var name = 'favorites',

/* private */

		// constants 

		FACEBOOK_STATUS = 'facebook-status',

		FAVORITE_PROGRAMMES = 'favorite-programmes',

		FAVORITE_CHANNELS = 'favorite-channels',

		// flags

		isConnectedToFacebook = false,

		// dom 

		_content,

		_favoriteProgrammes,

		_favoriteChannels,

		_invitation = dom.create('section');


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
		//_dashboardContent.insertBefore(_invitation, document.getElementById('featured').nextSibling); 
		var _invitation, _parragraph, _fbButton;
			_invitation = dom.element('div', { id: name + '-invitation' });
			_fbButton = dom.element('button', { class: 'Login', title: 'Login', 'data-action': 'LOGIN' });
			_parragraph = dom.element('p');
			_parragraph.appendChild(dom.text("Keep track your favorite shows and channels, recommend, comment and share it with your friends with your facebook account:"));
			_parragraph.appendChild(_fbButton);

			return 

	}

	function removeInvitation() { 
		var __invitation = document.getElementById('invitation');
		if (__invitation) {
			__invitation.parentNode.removeChild(__invitation);
		}
	}

	function renderChannels(channels) {

		var _favoriteChannels = layout({ id: FAVORITE_CHANNELS, title: 'You favourite channels now', icon: 'icon-star' }),
			favoriteChannelIds = [], url, channel, id;

			var extractId = /\d+/ig;

		// for all the favorite channels
		for (url in channels) {
			channel = channels[url].data['tv_channel'];
			//id = channel.url.split(a.ROOT_URL + 'channel/')[1];
			id = channel.url.match(extractId);
			favoriteChannelIds.push(id[0]);
		}

		if (favoriteChannelIds.length > 0) {
			_favoriteChannels.className = 'loading';
			console.log(favoriteChannelIds.join('|'));
			/*$(favoriteChannels).load('/dashboard/on-now/channels/' + favoriteChannelIds.join('|'), function(data, status, xhr){
				favoriteChannels.className = '';
				data = null;
				delete data;
			});*/
		} else {
			console.log('Favorite channels not found man, sorry!');
		}

		//_content.appendChild(_favoriteChannels);

		console.log('finish rendering channels');
	}

	// iterate the favorites, for each of them
	// fetch the now and next, and shows
	// only the programmes with next information
	function renderProgrames(programmes) {

		var _favoriteProgrammes = layout({ id: FAVORITE_PROGRAMMES, class: 'loading', title: 'You favourite shows now', icon: 'icon-star' }),
			favoriteProgrammeIds = [], url, programmes, id;
		
			var extractId = /\d+/ig;

		// for all the favorite channels
		for (url in programmes) {

			programme = programmes[url].data['tv_show'];

			//id = extractId.exec(programme.url);
			id = programme.url.match(extractId);

			if (id && id[0]) {
				favoriteProgrammeIds.push(id[0]);
			}

		}

		if (favoriteProgrammeIds.length > 0) {
			
			console.log(favoriteProgrammeIds.join("|"));

			EpgApi.getEventFromAPI(id[0]);

			/*$(favoriteProgrammes).load('/dashboard/on-now/programmes/' + favoriteProgrammeIds.join('|'), function(data, status, xhr) {
				favoriteProgrammes.className = '';
				data = null;
				delete data;
			});*/

		} else {
			console.log('Favorite progames not found man, sorry!');
		}

		//_content.appendChild(_favoriteProgrammes);

		console.log('finish rendering programmes');
	}


	function layout(props) {

		var _section, _article, _header, _h1, _title, _icon, _list;

		_icon = dom.element('i', { class: props.icon } );
		_title = dom.text( props.title );
		_h1 = dom.element('h1');
		_h1.appendChild(_icon);
		_h1.appendChild(_title);
		_header = dom.element('header');
		_header.appendChild(_h1);
		_list = dom.element('ul', { class: 'nowandnext-event-list' });
		_section = dom.element('section', { id: props.id });
		_section.appendChild(_header);
		_section.appendChild(_list);

		return _section;
	}

/* public */

	function initialize() {

		// subscribe to get re-render favorites
		Event.on(u.MODEL_CHANGED, handleDataChanges);

		return this;

	}

	function render(model) {

		_content = dom.doc.getElementById('dashboard-content');

		handleDataChanges(UserModel);

		if (!isConnectedToFacebook) {
			renderInvitation();
		} else {
			removeInvitation();
		}

		return this;

	}

	function finalize() {

		//removeInvitation();

		dom.empty(_content);

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