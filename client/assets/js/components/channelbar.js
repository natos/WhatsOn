/*
* ChannelBar
* ----------
* @class ChannelBar
*/

define([

	'config/grid',
	'models/grid'

], function ChannelBar(g, GridModel) {

/* private */

	var	$channellist = g.$channelsbar.find('ul')

	/* constructor */
	function initialize() {

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

	function modelChanged(obj) {
		if (obj.position) {
			$channellist.css({ top: obj.position.top });
		}
	};


/* public */
	return {
		initialize: initialize
	};

});