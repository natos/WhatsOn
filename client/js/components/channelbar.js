/*
* ChannelBar
* ----------
*/

define([

	'config/app',
	'config/channel',
	'config/grid',
	'config/user',
	'modules/app',
	'modules/event',
	'models/channel',
	'models/grid',
	'models/user',
	'utils/dom'

], function ChannelBarComponentScope(a, c, g, u, App, Event, ChannelModel, GridModel, UserModel, dom) {

	var name = 'channelbar',

/* private */

	// const

		FAVORITE_CHANNELS = 'favorite-channels',
		TOGGLE_FAVORITE = 'TOGGLE-FAVORITE',
		TOGGLE_EDITMODE = 'TOGGLE-EDIT-MODE',

		_channelsbar = dom.element('div', { id: 'channels-bar' }),
		_channellist = dom.element('ul', { id: 'channels-bar-list' }),

	/**
	* This is the set of channels that will be displayed in the channelbar,
	* and on the grid. This may be a subset of the complete list of channels
	* available to the app.
	*/
		_channels = [];

	function move(position) {
		if (_channellist) {
			_channellist.style.top = position.top + 'px';
		}
	}

	function removeLoadingClassName() {
		this.className = '';
	}

	function renderLogos(selectedChannels) {

		var channelimg,
			t = selectedChannels.length;

		while (t--) {
			channelImg = document.getElementById('channelImg'+selectedChannels[t]);
			// If the image doesn't have a src, set the src from the data-src attribute
			if (!channelImg.getAttribute('src')) {
				channelImg.setAttribute('src', channelImg.getAttribute('data-src'));

				// Temporarily give the image a "loading" className.
				// Remove this className when the image has loaded.
				channelImg.className = 'loading';
				channelImg.onload = removeLoadingClassName;
			}
		}

		// GC
		channelImg = null;
	}

	function handleGridModelChanges(changes) {

		if (typeof changes === 'undefined') { return; }

		// if there changes on the position object, move the bar
		if (changes.position) {
			move(changes.position);
		}

		// if there are changes on selected channels, render logos
		if (changes.selectedChannels) {
			renderLogos(changes.selectedChannels);
		}
	}

	function handleUserModelChanges(changes) {

		if (typeof changes === 'undefined') { return; }

		if (changes[FAVORITE_CHANNELS]) { renderChannelsGroup(); }

	}

	function handleActions(action, element) {
		switch (action) {
			case TOGGLE_EDITMODE:
				toggleChannelControls();
				break;
			case TOGGLE_FAVORITE:
				toggleFavorite(element);
				break;
		}
	}

	function toggleChannelControls() {
		_channelsbar.className = (_channelsbar.className === '') ? 'expanded' : '';
	}

	function toggleFavorite(element) {

		var type = 'upcsocial:tv_channel',
			id = element.dataset.id,
			url = element.dataset.url,
			favorite = element.getElementsByTagName('i')[0],
			isFavorite = favorite.className === 'icon-star';

		if (!url) { return; }

		if (isFavorite) {
			favorite.className = 'icon-star-empty';
			Event.emit(u.REMOVE_FAVORITE, id);
		} else {
			favorite.className = 'icon-star';
			Event.emit(u.ADD_FAVORITE, type, url);
		}
	}

/* public */

	function initialize() {

		// move with the grid
		Event.on(g.MODEL_CHANGED, handleGridModelChanges);
		Event.on(u.MODEL_CHANGED, handleUserModelChanges);
		Event.on(a.ACTION, handleActions);

		return this;
	}

	function render() {

		// grab the channellist
		_channelsbar.appendChild( dom.element('div', { class: 'shade' }) );
		_channelsbar.appendChild( _channellist );

		dom.main.appendChild(_channelsbar);

		renderChannelsGroup();

		return this;

	}

	function finalize() {

		_content.removeChild(_channelsbar);

		Event.off(g.MODEL_CHANGED, handleGridModelChanges);
		Event.off(u.MODEL_CHANGED, handleUserModelChanges);
		Event.off(a.ACTION, handleActions);

		return this;

	}

	/**
	* Determine what channels are visible in the viewport.
	* Optionally, return some channels above and below the visible
	* channel range, for pre-loading.
	* @public
	*/
	function getSelectedChannels(extraAboveAndBelow) {
		// How many channels have been scrolled vertically?
		var channelsScrolledUp = window.pageYOffset / g.ROW_HEIGHT,
			firstChannel = (channelsScrolledUp < 0) ? 0 : Math.floor(channelsScrolledUp),
			// TODO: calculate this based on actual dimensions
			topOffset = 100,
			// How many channels tall is the screen?
			channelsTall = (window.innerHeight - topOffset) / g.ROW_HEIGHT,
			channelIds = [],
			i = 0;

		if (!extraAboveAndBelow) {
			extraAboveAndBelow = 0;
		}

		// Return N channels above and below the visible window
		for (i = (0 - extraAboveAndBelow); i < (channelsTall + extraAboveAndBelow); i++) {
			if ( (firstChannel + i) < 0 || (firstChannel + i) >= _channels.length ) {
				continue;
			}
			channelIds.push(_channels[firstChannel + i].id);
		}

		return channelIds;

	}

	/**
	* Render the selected channels list and rows
	*/
	function renderChannelsGroup() {

		// grab selected channels from channel model
		_channels = ChannelModel[c.GROUPS][ChannelModel[c.SELECTED_GROUP]];

		_channellist = document.getElementById('channels-bar-list');

		var channelId, name, i, t = _channels.length, item, picture, image, logohref, favorite, favIcon, isFavorite,
			list = dom.create('fragment');

		// wipe the dom
		while (_channellist.firstChild) { _channellist.removeChild(_channellist.firstChild); }

		// render the selected collection
		for (i = 0; i < t; i++) {

			channelId = _channels[i].id;
			name = _channels[i].name;

			// check Favorite info
			isFavorite = (UserModel[FAVORITE_CHANNELS]) ? UserModel[FAVORITE_CHANNELS]['http://upcsocial.herokuapp.com/channel/' + channelId] : false;

			// don't know why, some logos are missing
			logohref = _channels[i].logo || '';

			// create logo image
			image = dom.create('img');
			image.setAttribute('id', 'channelImg' + channelId);
			image.setAttribute('title', name);
			image.setAttribute('data-src', logohref);

			// create logo container
			picture = dom.create('div');
			picture.className = 'picture';
			picture.appendChild(image);

			// favorite icon
			favIcon = dom.create('i');
			favIcon.className = (isFavorite) ? 'icon-star' : 'icon-star-empty';
			// favorite button
			favorite = dom.create('button');
			favorite.className = 'favorite';
			favorite.setAttribute('data-action', TOGGLE_FAVORITE);
			favorite.setAttribute('data-url', 'http://upcsocial.herokuapp.com/channel/' + channelId);
			// favorite node id from the open graph
			// we need this to delete the favorite
			// in the future
			if (isFavorite) { favorite.setAttribute('data-id', isFavorite.id); }
			// add content the button
			favorite.appendChild(favIcon);

			item = dom.create('li');
			item.appendChild(picture);
			item.appendChild(favorite);
			
			list.appendChild(item);

			// GC
			isFavorite = null;
			image = null;
			picture = null;
			favIcon = null;
			favorite = null;
			item = null;
		}

		// append to DOM
		_channellist.appendChild(list);

		// make sure that all the visible
		// channels have logos
		renderLogos(getSelectedChannels());

		// GC
		list = null;

		return;

	}


/* export */

	return {
		name		: name,
		initialize	: initialize,
		finalize	: finalize,
		render		: render,
		getSelectedChannels : getSelectedChannels
	};

});