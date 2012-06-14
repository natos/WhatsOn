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

	function move(position) {
		if (typeof $channellist === 'undefined') { $channellist = $('#channels-bar ul','#content'); }
		$channellist.css({ top: position.top + 'px' });
		return this;
	};

	function renderLogos(selectedChannels) {
		var channelimg, 
			t = selectedChannels.length,
			logos = $('#channels-bar .loading').removeAttr('src');

		while (t--) {
			channelimg = $('#channelImg'+selectedChannels[t]);
			channelimg.attr('src', channelimg.data('src'));
		}
	};

	function modelChanged(changes) {
		// if there changes on the position object, move the bar
		changes && changes.position && move(changes.position);
		// if there changes on selected channels, render logos
		changes && changes.selectedChannels && renderLogos(changes.selectedChannels);

		return this;
	};

/* public */

	function initialize() {

		// move with the grid
		App.on(g.MODEL_CHANGED, modelChanged);

		return this;

	};

	function render() {

		var $channelrow = $('<div>')
				.addClass('channel-container')

		// Create channel containers
		// as rows in the grid
		for (var i = 0; i < channels.length; i++) {
			$channelrow
				.clone()
				.attr({ 'id': 'cc_' + channels[i].id })
				.css({ 'height': g.ROW_HEIGHT + 'px', 'top': i * g.ROW_HEIGHT + 'px' })
				.appendTo('#grid-container');
		}

		return this;
	};

	function finalize() {

		App.off(g.MODEL_CHANGED, modelChanged);

		return this;

	};

/* export */

	return {
		name		: name,
		initialize	: initialize,
		finalize	: finalize,
		render		: render
	};

});