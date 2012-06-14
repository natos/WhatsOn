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

/* abstract */

	function initialize() {

		return this;

	}

	function finalize() {

		return this;

	}

/* export */

	return new Controller({
		name		: name,
		initialize	: initialize,
		finalize	: finalize,
		view		: NowAndNextView
	});

});