/* 
* 404Controller
* -------------
*
*/

define([

	'views/notfound',
	'lib/flaco/controller'

], function ProgrammeControllerScope(notfound, Controller) {


	var name = 'notfound';

/* private */

/* public */

/* abstract */ 

	function initialize(State) {

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
		view		: notfound
	});

});