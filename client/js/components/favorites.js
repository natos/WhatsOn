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
	'utils/language',
	'utils/dom',
	'utils/convert'

], function(a, u, c, App, Event, UserModel, ChannelModel, EpgApi, Language, dom, convert) {

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

		_favoriteProgrammes,

		_favoriteChannels,

		_invitation;


	function handleDataChanges(model) {

		if (!model) { model = UserModel; }

		if (typeof model === 'undefined') {
			console.log('Warning!', 'Favorites', 'No UserModel available, skip rendering!');
			return;
		}


		isConnectedToFacebook = (model[FACEBOOK_STATUS] && model[FACEBOOK_STATUS]['status'] === u.CONNECTED);

		if (!isConnectedToFacebook) {

			if (!_invitation) {
				renderInvitation();
			}

		} else {

			if (_invitation) {
				removeInvitation();
			}
		}


		if (model[FAVORITE_PROGRAMMES]) { renderProgrames(model[FAVORITE_PROGRAMMES]); }

		if (model[FAVORITE_CHANNELS]) { renderChannels(model[FAVORITE_CHANNELS]); }

		return;

	}

	function renderInvitation() {

		var _parragraph, _fbButton;
			_section = layout({ id: 'invitation', class: 'loading', title: 'Login with Facebook', icon: 'icon-star' });
			_fbButton = dom.element('button', { class: 'login', title: 'Login', 'data-action': 'LOGIN' });
			_fbButton.appendChild(dom.element('i', { class: 'icon-facebook-sign' }));
			_fbButton.appendChild(dom.text('Login'));
			_parragraph = dom.element('p', {}, "Keep track your favorite shows and channels, recommend, comment and share it with your friends with your facebook account: ");
			_parragraph.appendChild(_fbButton);
			_invitation = dom.element('article');
			_invitation.appendChild(_parragraph);
			_section.appendChild(_invitation);
			dom.content.appendChild(_section);
	}

	function removeInvitation() { 
		_invitation.parentNode.removeChild(_invitation);
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
			require(['json!' + a.FEED_PROXY_BASE_PATH + '/nowandnext/ie/' + favoriteChannelIds.join('|') + '/channels.json'], function(channelData) {
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
				dom.content.appendChild(
					layout({ id: FAVORITE_CHANNELS, title: title, icon: 'icon-star', list: list })
				);
			});
		} else {
			// Show instructions
			list.appendChild(dom.element('li', {}, _lang.tranlate('dash-favorite-channels-none-added')));
			favoriteChannelsBlock = layout({ id: FAVORITE_CHANNELS, title: title, icon: 'icon-star', list: list });
		}

		dom.content.appendChild(favoriteChannelsBlock);

	}

	function renderProgrames(favoriteProgrammeIds) {

		var favoriteProgrammesBlock;
		var list = dom.element('ul');
		var title = _lang.translate('dash-favorite-shows-title');

		if (favoriteProgrammeIds.length > 0) {

			// Show loading message
			list.appendChild(dom.element('li', {'class':'loading'}, _lang.translate('loading')));
			favoriteProgrammesBlock = layout({ id: FAVORITE_PROGRAMMES, title: title, icon: 'icon-star', list: list });

			// Go and load next events for favourite programmes
			require(['json!' + a.FEED_PROXY_BASE_PATH + '/nowandnext/ie/' + favoriteProgrammeIds.join('|') + '/programmes.json'], function(programmesData) {
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
				dom.content.appendChild(
					layout({ id: FAVORITE_PROGRAMMES, title: title, icon: 'icon-star', list: list })
				);
			});
		} else {
			// Show instructions
			list.appendChild(dom.element('li', {}, _lang.translate('dash-favorite-shows-none-added')));
			favoriteProgrammesBlock = layout({ id: FAVORITE_PROGRAMMES, title: title, icon: 'icon-star', list: list });
		}

		dom.content.appendChild(favoriteProgrammesBlock);

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


		handleDataChanges(UserModel);

		return this;

	}

	function finalize() {

		dom.content.removeChild(_favoriteProgrammes);
		
		dom.content.removeChild(_favoriteChannels);

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