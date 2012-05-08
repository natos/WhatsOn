define([

	'config/grid',
	'models/grid'

], function(g, GridModel) {

/* private */

function modelChanged(obj) {
	if (obj.position) {
		$channellist.css({ top: obj.position.top });
	}
};

var	$channellist = g.$channelsbar.find('ul'),

/* @class ChannelBar */
	ChannelBar = {};

	/* constructor */
	ChannelBar.initialize = function() {

		// move with the grid
		upc.on(g.MODEL_CHANGED, modelChanged);

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

	return ChannelBar;

});