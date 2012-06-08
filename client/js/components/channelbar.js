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
		$channellist && $channellist.css({ top: position.top });
	};

	function modelChanged(obj) {
		obj && obj.position && move(obj.position);
	};

/* public */

	function initialize() {

		$channellist = $('#channels-bar').find('ul')

		// move with the grid
		App.on(g.MODEL_CHANGED, modelChanged);

		return this;

	};

	function render() {

		// Create channel containers
		// as rows in the grid
		for (var i = 0; i < channels.length; i++) {
			$('<div>')
				.attr({ 'id': 'cc_' + channels[i].id })
				.addClass('channel-container')
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
		name: name,
		initialize: initialize,
		finalize: finalize,
		render: render
	};

});