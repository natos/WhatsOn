/* 
* NowAndNextView 
* -------------
*
*/

define([

	'config/app',
	'modules/app',
	'lib/flaco/view'

], function NowAndNextViewContext(a, App, View) {

	var name = 'nowandnext';

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

		return this;

	};

	/**
	 * Set up event handlers.
	 * @private
	 */
	function render() {

		channelsListContainer = $('#channels-list-container');

		// Observe clicks on 'earlier' and 'later' links,
		// and use ajax to replace the channels list content
		channelsListContainer.on('click', 'a.earlier, a.later', function(e) {
			e.preventDefault();
			e.stopPropagation();
			channelsListContainer.load(e.target.href + ' #channels-list-container');
		});

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
	return new View({
		name: name,
		initialize: initialize,
		finalize: finalize,
		render: render,
	});

});