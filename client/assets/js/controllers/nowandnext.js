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

	/**
	 * Activate the associated view, and set up event handlers
	 * @public
	 */
	function initialize() {

		NowAndNextView.initialize();

		return this;

	};

	/**
	 * Deactivate the associated view, and clean up event handlers
	 * @public
	 */
	function finalize() {

		NowAndNextView.finalize();

	}

	/* public */
	return {
		name: 'nowandnext',
		initialize: initialize,
		finalize: finalize,
		view: NowAndNextView
	};

});