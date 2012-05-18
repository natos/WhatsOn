/* 
* NowAndNextController 
* -------------
*
*/

define([

	'config/app',
	'modules/app',
	'views/nowandnext'

], function NowAndNextController(c, App, NowAndNextView) {

/* private */

	/* constructor */
	function initialize() {

		return this;

	};

/* public */
	return {
		name: 'nowandnext',
		initialize: initialize,
		view: NowAndNextView
	};

});