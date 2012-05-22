/*
* ChannelBar
* ----------
* @class ChannelBar
*/

define([

	'config/grid',
	'models/grid',
	'modules/app'

], function ChannelBar(g, GridModel, App) {

	var	$channellist;

	/**
	 * Load the content for the component
	 * Set up event handlers.
	 * @public
	 */
	function initialize() {

		$channellist = $('#channels-bar').find('ul')

		// move with the grid
		upc.on(g.MODEL_CHANGED, modelChanged);

		// Map Channel ID / OffsetTop
		var channels = App.channels;
		for (var i = 0; i < channels.length; i++) {
			$('<div>')
				.attr({ 'id': 'cc_' + channels[i].id })
				.addClass('channel-container')
				.css({ 'height': g.ROW_HEIGHT + 'px', 'top': i * g.ROW_HEIGHT + 'px' })
				.appendTo('#grid-container');
		}

		return this;

	};

	/**
	 * If necessary, remove the content for the component from the DOM.
	 * Clean up event handlers.
	 * @public
	 */
	function finalize() {
		upc.off(g.MODEL_CHANGED, modelChanged);
	};

	/**
	 * Handler for model data changes.
	 * @private
	 */
	function modelChanged(obj) {
		if (obj.position) {
			$channellist.css({ top: obj.position.top });
		}
	};


	/* public */
	return {
		initialize: initialize,
		finalize: finalize
	};

});