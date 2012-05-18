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

/* private */

	function initialize() {
	
		return this;
	
	};

/* public */
	return {
		name: 'channel',
		/* constructor */
		initialize: initialize,
		view: ChannelView
	};

});