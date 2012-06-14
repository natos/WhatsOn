/*
* BufferComponent
* ---------------
* @class Buffer
*/

define([

	'config/grid',
	'models/grid',
	'modules/app'

], function Buffer(g, GridModel, App) {

	var name = 'buffer';

/* private */

	function grooming() {

		if (this.timer) { clearTimeout(this.timer); }

		this.timer = setTimeout(clean, 250);

	}

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
				if ( $.inArray(channel, visibleChannels) === -1 ) { event.remove(); }
			});
		}
	}

/* public */

	function initialize() {

		App.on(g.GRID_RENDERED, grooming);

		return this;

	}

	function render() {

		// nothing to do here...

		return this;

	}

	function finalize() {

		App.off(g.GRID_RENDERED, grooming);

		return this;

	}

/* export */

	return {
		name		: name,
		initialize	: initialize,
		finalize	: finalize,
		render		: render
	};

});