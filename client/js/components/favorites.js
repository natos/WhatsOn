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
	'utils/dom',
	'utils/language'

], function(appConfig, u, c, App, Event, UserModel, ChannelModel, EpgApi, dom, Language) {

	var name = 'favorites',
		_lang,

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
			_fbButton = dom.element('button', { 'class': 'Login', title: 'Login', 'data-action': 'LOGIN' });
			_parragraph = dom.element('p');
			_parragraph.appendChild(dom.text("Keep track your favorite shows and channels, recommend, comment and share it with your friends with your facebook account:"));
			_parragraph.appendChild(_fbButton);

			return;

	}

	function removeInvitation() {
		var __invitation = document.getElementById('invitation');
		if (__invitation) {
			__invitation.parentNode.removeChild(__invitation);
		}
	}

	function renderChannels(favoriteChannelIds) {

		var favoriteChannelsBlock;
		var list = dom.element('ul');
		var title = _lang.translate('dash-favorite-channels-title');

		if (favoriteChannelIds.length > 0) {

			// Show loading message
			list.appendChild(dom.element('li', {'class':'loading'}, _lang.translate('loading')));
			favoriteChannelsBlock = layout({ id: FAVORITE_CHANNELS, title: title, icon: 'icon-star', list: list });

			// Go and load now&next for favourite channels
			require(['json!' + appConfig.FEED_PROXY_BASE_PATH + '/nowandnext/ie/' + favoriteChannelIds.join('|') + '/channels.json'], function(channelData) {
				var channelId, eventsForChannel, i, eventsCount, e;
				var list = dom.element('ul');

				// TODO: proper layout for now&next events in this block
				for (channelId in channelData) {
					eventsForChannel = channelData[channelId];
					eventsCount = eventsForChannel.length;
					for (i=0; i<eventsCount; i++) {
						e = eventsForChannel[i];
						list.appendChild(dom.element('li', {}, e.service.id + ' ' + e.programme.title + ' ' + e.start));
					}
				}

				favoriteChannelsBlock.parentNode.removeChild(favoriteChannelsBlock);
				_content.appendChild(
					layout({ id: FAVORITE_CHANNELS, title: title, icon: 'icon-star', list: list })
				);
			});
		} else {
			// Show instructions
			list.appendChild(dom.element('li', {}, _lang.tranlate('dash-favorite-channels-none-added')));
			favoriteChannelsBlock = layout({ id: FAVORITE_CHANNELS, title: title, icon: 'icon-star', list: list });
		}

		_content.appendChild(favoriteChannelsBlock);

	}

	// iterate the favorites, for each of them
	// fetch the now and next, and shows
	// only the programmes with next information
	function renderProgrames(favoriteProgrammeIds) {

		var favoriteProgrammesBlock;
		var list = dom.element('ul');
		var title = _lang.translate('dash-favorite-shows-title');

		if (favoriteProgrammeIds.length > 0) {

			// Show loading message
			list.appendChild(dom.element('li', {'class':'loading'}, _lang.translate('loading')));
			favoriteProgrammesBlock = layout({ id: FAVORITE_PROGRAMMES, title: title, icon: 'icon-star', list: list });

			// Go and load next events for favourite programmes
			require(['json!' + appConfig.FEED_PROXY_BASE_PATH + '/nowandnext/ie/' + favoriteProgrammeIds.join('|') + '/programmes.json'], function(programmesData) {
				var programmeId, eventsForProgramme, i, eventsCount, e;
				var list = dom.element('ul');
				var programmesFound = 0;

				// TODO: proper layout for now&next events in this block
				for (programmeId in programmesData) {
					programmesFound += 1;
					eventsForProgramme = programmesData[programmeId];
					eventsCount = eventsForProgramme.length;
					for (i=0; i<eventsCount; i++) {
						e = eventsForProgramme[i];
						list.appendChild(dom.element('li', {}, e.programme.title + ' on channel ' + e.service.id + ' at ' + e.start));
					}
				}

				if (programmesFound === 0) {
					list.appendChild(dom.element('li', {}, _lang.translate('dash-favorite-shows-none-found')));
				}

				favoriteProgrammesBlock.parentNode.removeChild(favoriteProgrammesBlock);
				_content.appendChild(
					layout({ id: FAVORITE_PROGRAMMES, title: title, icon: 'icon-star', list: list })
				);
			});
		} else {
			// Show instructions
			list.appendChild(dom.element('li', {}, _lang.translate('dash-favorite-shows-none-added')));
			favoriteProgrammesBlock = layout({ id: FAVORITE_PROGRAMMES, title: title, icon: 'icon-star', list: list });
		}

		_content.appendChild(favoriteProgrammesBlock);

	}


	function layout(props) {

		var section, article, header, h1, title, icon, list;

		icon = dom.element('i', { 'class': props.icon } );
		title = dom.text( props.title );
		h1 = dom.element('h1');
		h1.appendChild(icon);
		h1.appendChild(title);
		header = dom.element('header');
		header.appendChild(h1);
		if (props.list) {
			list = props.list;
		} else {
			list = dom.element('ul', { 'class': 'nowandnext-event-list' });
		}
		section = dom.element('section', { id: props.id });
		section.appendChild(header);
		section.appendChild(list);

		return section;
	}

/* public */

	function initialize() {

		_lang = new Language(App.selectedLanguageCode);

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