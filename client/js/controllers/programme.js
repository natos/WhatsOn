/* 
* ProgrammeController
* ------------------
*
*/

define([

	'lib/flaco/controller',
	'views/programme'

], function ProgrammeControllerScope(Controller, ProgrammeView) {


	var name = 'programme';

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
		view		: ProgrammeView
	});

});