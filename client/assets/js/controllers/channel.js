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