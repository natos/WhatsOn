/* 
* ChannelView
* -----------
*
* Controlls channel page
*
*/
define([
	
	'config/app',
	'modules/app'

], function ChannelView(appConfig, App) {

	/**
	 * Load the content for the view.
	 * Activate associated components.
	 * Set up event handlers.
	 * @public
	 */
	function initialize(params) {
		var channelId = params.channelId;

		App.loadCss('/assets/css/channelpage.css');
		App.loadCss('/assets/css/channel-event-list.css');

		$('#content').load('/channel/' + channelId + ' #content', function(data, status, xhr){
			App.emit(appConfig.VIEW_LOADED);
		});
	
	};

	/**
	 * If necessary, remove the content for the view from the DOM.
	 * Deactivate associated components. 
	 * Clean up event handlers.
	 * @public
	 */
	function finalize() {

	};

	/* public */
	return {
		initialize: initialize,
		finalize: finalize
	}
});