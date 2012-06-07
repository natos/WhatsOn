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

	var name = 'channelbar';

	var	$channellist;

	/**
	 * Load the content for the component
	 * Set up event handlers.
	 * @public
	 */
	function initialize() {

		$channellist = $('#channels-bar').find('ul')

		// move with the grid
		App.on(g.MODEL_CHANGED, modelChanged);

		return this;

	};

	function render() {

		// Map Channel ID / OffsetTop
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
		App.off(g.MODEL_CHANGED, modelChanged);
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
		name: name,
		initialize: initialize,
		finalize: finalize,
		render: render
	};

});