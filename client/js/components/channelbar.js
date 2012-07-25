/*
* ChannelBar
* ----------
*/

define([

	'config/channel',
	'config/grid',
	'models/channel',
	'models/grid',
	'modules/app',
	'utils/dom'

], function ChannelBar(c, g, ChannelModel, GridModel, App, dom) {

	var name = 'channelbar',

/* private */
		_template = document.getElementById('channelsbar-template'),
		_content = document.getElementById('content'),
		_channelbar = document.createElement('div'),
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

		var channelimg, 
			t = selectedChannels.length;

		while (t--) {
			channelImg = document.getElementById('channelImg'+selectedChannels[t]);
			channelImg.className = ''; // remove loading
			channelImg.setAttribute('src', channelImg.getAttribute('data-src'));
		}

		// GC
		channelImg = null;
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
		_channelbar.id = 'channels-bar';
		_channelbar.innerHTML = _template.innerHTML;
		_content.appendChild(_channelbar);
		_channellist = document.getElementById('channels-bar-list');

		renderChannelsGroup();

		return this;

	}

	function finalize() {

		_content.removeChild(_channelbar);

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

		// grab selected channels from channel model
		_channels = ChannelModel[c.GROUPS][ChannelModel[c.SELECTED_GROUP]];

		_channellist = document.getElementById('channels-bar-list');

		var channelId, name, i, t = _channels.length, item, picture, image, 
			list = dom.create('fragment');

		// wipe the dom
		while (_channellist.firstChild) { _channellist.removeChild(_channellist.firstChild); }

		// render the selected collection
		for (i = 0; i < t; i++) {

			channelId = _channels[i].id;
			name = _channels[i].name;

			image = dom.create('img');
			image.className = 'loading';
			image.setAttribute('id', 'channelImg' + channelId);
			image.setAttribute('title', name);
			image.setAttribute('data-src', 'http://www.upc.nl' + _channels[i].logo.href + '?size=medium');

			picture = dom.create('div');
			picture.className = 'picture';
			picture.appendChild(image);

			item = dom.create('li');
			item.appendChild(picture);
			
			list.appendChild(item);

			// GC
			image = null;
			picture = null;
			item = null;
		}

		// append to DOM
		_channellist.appendChild(list);

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