define([

	'config/grid'

], function(g) {

/* private */

var	$channellist = g.$channelsbar.find('ul'),

/* @class ChannelBar */
	ChannelBar = {};

	/* constructor */
	ChannelBar.initialize = function() {

		// move with the grid
		g.$body.on(g.GRID_MOVED, this.move);

		// Map Channel ID / OffsetTop
		for (var i = 0; i < channels.length; i++) {
			$('<div>')
				.attr({ 'id': 'cc_' + channels[i].id })
				.addClass('channel-container')
				.css({ 'height': g.ROW_HEIGHT + 'px', 'top': i * g.ROW_HEIGHT + 'px' })
				.appendTo(g.$container);
		}

		return this;

	};

	ChannelBar.getSelectedChannels = function(extraAboveAndBelow) {

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

		// Return 2 channels above and below the visible window 
		for (i = (0 - extraAboveAndBelow); i < (channelsTall + extraAboveAndBelow); i++) {
			if ( (firstChannel + i) < 0 || (firstChannel + i) >= channels.length ) {
				continue;
			}
			channelIds.push(channels[firstChannel + i].id);
		}

		return channelIds;

	};

	ChannelBar.move = function(event) {

		$channellist.css({ 'top': window.pageYOffset * -1 });

	};

	return ChannelBar;

});