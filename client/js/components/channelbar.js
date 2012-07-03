/*
* ChannelBar
* ----------
*/

define([

	'config/channel',
	'config/grid',
	'models/channel',
	'models/grid',
	'modules/app'

], function ChannelBar(c, g, ChannelModel, GridModel, App) {

	var name = 'channelbar',

/* private */

		_channellist,

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

	function renderLogos(selectedChannels) {

		var channelImg,
			t = selectedChannels.length;

		while (t--) {
			channelImg = document.getElementById('channelImg'+selectedChannels[t]);
			channelImg.className = ''; // remove loading
			channelImg.setAttribute('src', channelImg.getAttribute('data-src'));
		}
	}

	function modelChanged(changes) {
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

/* public */

	function initialize() {

		// move with the grid
		App.on(g.MODEL_CHANGED, modelChanged);

		return this;
	}

	function render() {

		// grab the channellist
		_channellist = document.getElementById('channels-bar-list');

		return this;

	}

	function finalize() {

		App.off(g.MODEL_CHANGED, modelChanged);

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

		// DRY Alert!
		// This function is needed in other components.
		// NS: Maybe is a good idea to create a map of logos
		//		and cache it on the channelModel something
		//		easy like: ChannelModel.logos[ChannelID]...
		function getLogo(channel) {
			if (!channel.links) { return; }
			var foundif = false, t = channel.links.length;
			while (t--) { if (channel.links[t].rel === "logo") { foundit = channel.links[t]; } }
			return foundit;
		}
		// grab selected channels from channel model
		_channels = ChannelModel[c.GROUPS][ChannelModel[c.SELECTED_GROUP]];

		// iterate channel collection
		var channelId, name, i, t = _channels.length, item, picture, image, 
			list = document.createDocumentFragment(), 
			listItem = document.createElement('li'), 
			div = document.createElement('div'), 
			img = document.createElement('img');

		for (i = 0; i < t; i++) {

			channelId = _channels[i].id;
			name = _channels[i].name;

			image = img.cloneNode(false);
			image.className = 'loading';
			image.setAttribute('id', 'channelImg' + channelId);
			image.setAttribute('title', name);
			image.setAttribute('data-src', 'http://www.upc.nl' + getLogo(_channels[i]).href + '?size=medium');

			picture = div.cloneNode(false);
			picture.className = 'picture';
			picture.appendChild(image);

			item = listItem.cloneNode(false);
			item.appendChild(picture);
			
			list.appendChild(item);

		}

		// append to DOM
		document.getElementById('channels-bar-list').appendChild(list);

		return;

	}


/* export */

	return {
		name		: name,
		initialize	: initialize,
		finalize	: finalize,
		render		: render,
		getSelectedChannels : getSelectedChannels,
		renderChannelsGroup : renderChannelsGroup
	};

});