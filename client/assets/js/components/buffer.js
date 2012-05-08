define([

	'config/grid',
	'models/grid'

], function(g, GridModel) {

/* private */

// TODO: this should be refactor with the new Grid Model
var clean = function() {

	var events = $('.grid-event'), event, channel,

	visibleChannels = GridModel.selectedChannels;

	// to much elements out there
	if ( events.length > g.MAX_DOM_ELEMENTS ) {

		// each event in the dom
		events.each(function(i, e) {
			event = $(e);
			channel = event.parent().attr('id').split('cc_').join('');
			// is the channel not visible? remove the element
			if ( $.inArray(channel, visibleChannels) === -1 ) {
				event.remove();
			}
		});
	}
};

/* @class ChannelBar */
	Buffer = {};

	/* constructor */
	Buffer.initialize = function() {

		upc.on(g.GRID_RENDERED, this.grooming);

		return this;

	};

	Buffer.grooming = function() {

		if (this.timer) { clearTimeout(this.timer); }

		this.timer = setTimeout(clean, 300);
	};

	return Buffer;

});