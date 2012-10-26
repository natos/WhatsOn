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
	'utils/convert'

], function(a, u, c, App, Event, UserModel, ChannelModel, EpgApi, dom, convert) {

	var name = 'favorites',

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
			
			_favoriteProgrammes = layout({ id: FAVORITE_PROGRAMMES, class: 'loading', title: 'You favourite shows now', icon: 'icon-star' });
			_favoriteChannels = layout({ id: FAVORITE_CHANNELS, class: 'loading', title: 'You favourite channels now', icon: 'icon-star' });

			dom.content.appendChild(_favoriteProgrammes);
			dom.content.appendChild(_favoriteChannels);
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
			_parragraph = dom.element('p');
			_parragraph.appendChild(dom.text("Keep track your favorite shows and channels, recommend, comment and share it with your friends with your facebook account: "));
			_parragraph.appendChild(_fbButton);
			_invitation = _section.getElementsByTagName('article')[0];
			_invitation.appendChild(_parragraph);
			_section.appendChild(_invitation);
			dom.content.appendChild(_section);
	}

	function removeInvitation() { 
		_invitation.parentNode.removeChild(_invitation);
	}

	function renderChannels(channels) {

		var favoriteChannelIds = [], url, channel, id, now,

			extractId = /\d+/ig;

		// for all the favorite channels
		for (url in channels) {
			channel = channels[url].data['tv_channel'];
			//id = channel.url.split(a.ROOT_URL + 'channel/')[1];
			id = channel.url.match(extractId);
			if (id && id[0]) {
				favoriteChannelIds.push(id[0]);
			}
		}

		if (favoriteChannelIds.length > 0) {
			_favoriteChannels.className = 'loading';
			now = convert.formatTimeForApiRequest(new Date());
			//EpgApi.getNowAndNextForChannels(favoriteChannelIds.join(','), convert.formatTimeForApiRequest(new Date()));
			EpgApi.getNowAndNextForChannels('s-7s', now);
		} else {

			var message = dom.element('p');
				message.appendChild(dom.text("Save channels to your favourites, and we will show you what is showing now and next."));

			_favoriteChannels.getElementsByTagName('article')[0].appendChild(message);

			message = null;
		}

		console.log('finish rendering channels');
	}

	function handleNowAndNextEventsFromChannels() {
		console.log('handleNowAndNextEventsFromChannels', arguments);
	}

	// iterate the favorites, for each of them
	// fetch the now and next, and shows
	// only the programmes with next information
	function renderProgrames(programmes) {

		var favoriteProgrammeIds = [], url, programmes, id,
		
			extractId = /\d+/ig;

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

			// TODO: Fetch now and next of favorite programmes

			//EpgApi.getEventFromAPI(id[0]); // event id? programme id? what to do here?

		} else {

			var message = dom.element('p');
				message.appendChild(dom.text("We can not find any of your favorite shows on TV right now."));
			
			_favoriteProgrammes.getElementsByTagName('article')[0].appendChild(message);

			message = null;
		}

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
		_article = dom.element('article');
		_article.appendChild(_header);
		_article.appendChild(_list);
		_section = dom.element('section', { id: props.id });
		_section.appendChild(_article);

		return _section;
	}

/* public */

	function initialize() {

		// subscribe to get re-render favorites
		Event.on(u.MODEL_CHANGED, handleDataChanges);

		Event.on(c.NOWANDNEXT_RECEIVED, handleNowAndNextEventsFromChannels);

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

		Event.off(c.NOWANDNEXT_RECEIVED, handleNowAndNextEventsFromChannels);

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