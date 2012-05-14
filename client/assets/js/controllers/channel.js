/* 
* ChannelController
* ------------------
*
*/

define([

	'config/app',
	'controllers/app',
	'views/channel'

], function ChannelController(c, App, ChannelView) {

/* private */

	function initialize() {

		// Let the App know your here
		App.controllers.channel = this;
	
		return this;
	
	};

/* public */
	return {
		/* constructor */
		initialize: initialize,
		view: ChannelView.initialize()
	};

});