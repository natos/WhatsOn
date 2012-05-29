/* 
* NowAndNextView 
* -------------
*
*/

define([

	'config/app',
	'modules/app'

], function NowAndNextView(c, App) {

/* private */

	var channelsListContainer;

	/**
	 * Load the content for the view.
	 * Activate associated components.
	 * Set up event handlers.
	 * @public
	 */
	function initialize() {

		App.loadCss('/assets/css/nowandnext.css');
		App.loadCss('/assets/css/channel-event-list.css');
		var that = this;

		if ($('#content').find('#content-nowandnext').length>0) {
			// Now-and-next container is already loaded
			initEvents();
		} else {
			// Get now-and-next container from server
			$('#content').load('/nowandnext', function(data, status, xhr){
				initEvents();
			});
		}

		return this;

	};

	/**
	 * Set up event handlers.
	 * @private
	 */
	function initEvents() {
		channelsListContainer = $('#channels-list-container');

		// Observe clicks on 'earlier' and 'later' links,
		// and use ajax to replace the channels list content
		channelsListContainer.on('click', 'a.earlier, a.later', function(e) {
			e.preventDefault();
			e.stopPropagation();
			channelsListContainer.load(e.target.href + ' #channels-list-container');
		});

		App.emit(c.VIEW_LOADED, 'nowandnext');

	}

	/**
	 * If necessary, remove the content for the view from the DOM.
	 * Deactivate associated components. 
	 * Clean up event handlers.
	 * @public
	 */
	function finalize() {

		channelsListContainer.off('click');

	}


	/* public */
	return {
		initialize: initialize,
		finalize: finalize
	};

});