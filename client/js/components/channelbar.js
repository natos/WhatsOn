/*
* ChannelBar
* ----------
*/

define([

	'config/grid',
	'models/grid',
	'modules/app'

], function ChannelBar(g, GridModel, App) {

	var name = 'channelbar';

/* private */

	var	$channellist;

	/**
	 * This is the set of channels that will be displayed in the channelbar,
	 * and on the grid. This may be a subset of the complete list of channels
	 * available to the app.
	 */
	var _channels = [];

	function move(position) {
		if (typeof $channellist === 'undefined') { $channellist = $('#channels-bar-list'); }
		$channellist.css({ top: position.top + 'px' });
	}

	function renderLogos(selectedChannels) {
		var channelimg, 
			t = selectedChannels.length,
			logos = $('#channels-bar .picture img').removeAttr('src').addClass('loading');

		while (t--) {
			channelimg = $('#channelImg'+selectedChannels[t]);
			channelimg.attr('src', channelimg.data('src')).removeClass('loading');
		}
	}

	function modelChanged(changes) {
		if (typeof changes === 'undefined') { return; }
		// if there changes on the position object, move the bar
		if (changes.position) {
			move(changes.position);
		}
		// if there changes on selected channels, render logos
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
	 * Render the channels bar for the specified group id
	 */
	function renderChannelsGroup(channels) {
		// Set the class-level list of channels
		_channels = channels;

		// DRY Alert!
		// This function is needed in other components.
		function getLogo(channel) {
			if (!channel.links) { return; }
			var foundif = false, t = channel.links.length;
			while (t--) { if (channel.links[t].rel === "logo") { foundit = channel.links[t]; } }
			return foundit;
		}

		// Render the list of channels we want to use.
		var i, channel, t = channels.length, output = [];

		// Create the channel items in the channel bar, and the
		// row containers for the grid
		for (i = 0; i < t; i++) {
			channel = channels[i];
			// There's a link rel=logo in the links collections
			// we need to improve this, not always the logo is
			// the first link on the collection
			output.push('<li><div class="picture"><img class="loading" title="' + channel.name + '" data-src="http://www.upc.nl' + getLogo(channel).href + '?size=medium" data-channelid="' + channel.id + '" id="channelImg' + channel.id + '" title=</li>');
		}

		$('#channels-bar-list').html(output.join(''));
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