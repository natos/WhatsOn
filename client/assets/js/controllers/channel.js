/* 
* ChannelController
* ------------------
*
*/

define([

	'config/app',
	'modules/app',
	'views/channel'

], function ChannelController(c, App, ChannelView) {

	/**
	 * Activate the associated view, and set up event handlers
	 * @public
	 */
	function initialize(params) {

		// If no channelId, look to the URL pathname
		if (!params.channelId) {
			var pathParts = window.location.pathname.split('/');
			if (pathParts.length>=2 && pathParts[1].toUpperCase()==='CHANNEL') {
				params.channelId = pathParts[2];
			}
		}
		ChannelView.initialize(params);

		return this;
	
	};

	/**
	 * Deactivate the associated view, and clean up event handlers
	 * @public
	 */
	function finalize() {

		ChannelView.finalize();

	};


	/* public */
	return {
		name: 'channel',
		initialize: initialize,
		finalize: finalize,
		view: ChannelView
	};

});