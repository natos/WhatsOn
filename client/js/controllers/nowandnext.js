/* 
* NowAndNextController 
* -------------
*
*/

define([

	'config/app',
	'modules/app',
	'lib/flaco/controller',
	'views/nowandnext'

], function NowAndNextController(c, App, Controller, NowAndNextView) {

	var name = 'nowandnext';

/* private */

/* public */

	/**
	 * Activate the associated view, and set up event handlers
	 * @public
	 */
	function initialize() {

		return this;

	};

	/**
	 * Deactivate the associated view, and clean up event handlers
	 * @public
	 */
	function finalize() {

		return this;

	}

/* export */

	return new Controller({
		name: name,
		initialize: initialize,
		finalize: finalize,
		view: NowAndNextView
	});

});