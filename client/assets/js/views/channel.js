/* 
* ChannelView
* -----------
*
* Controlls channel page
*
*/
define([
	
	'config/app',
	'controllers/app'

], function ChannelView(c, App) {

/* private */

	/* constructor */
	function initialize() {
	
		App.emit(c.VIEW_LOADED);
	
	};

/* public */
	return {
		initialize: initialize
	}
});