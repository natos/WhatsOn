/* 
* NowAndNextController 
* -------------
*
*/

define([

	'config/app',
	'controllers/app',
	'views/nowandnext'

], function NowAndNextController(c, App, NowAndNextView) {

/* private */

	/* constructor */
	function initialize() {

		// Let the App know you're here
		App.controllers.nowandnext = this;

		return this;

	};

/* public */
	return {
		initialize: initialize,
		view: NowAndNextView.initialize()
	};

});