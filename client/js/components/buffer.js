/*
* BufferComponent
* ---------------
* @class Buffer
*/

define([

	'config/grid',
	'models/grid'

], function Buffer(g, GridModel) {

	/**
	 * Load the content for the component
	 * Set up event handlers.
	 * @public
	 */
	function initialize() {

		upc.on(g.GRID_RENDERED, grooming);

		return this;

	};

	/**
	 * If necessary, remove the content for the component from the DOM.
	 * Clean up event handlers.
	 * @public
	 */
	function finalize() {
		upc.off(g.GRID_RENDERED, grooming);
	};

	function grooming() {

		if (this.timer) { clearTimeout(this.timer); }

		this.timer = setTimeout(clean, 300);
	};

	// TODO: this should be refactor with the new Grid Model
	function clean() {
	
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

	/* public */
	return {
		initialize: initialize,
		finalize: finalize
	};

});