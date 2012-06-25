/* 
* ProgrammeView
* --------------
*
* Controlls programme page
*
*/
define([
	
	'lib/flaco/view',
	'components/social'

], function ProgrammeViewScope(View, Social) {

	var name = 'programme';

/* private */

/* public */

	var components = { social: Social };

/* abstract */

	function initialize(State) {

		return this;

	}

	function render() {

		return this;

	}

	function finalize() {

		return this;

	}

/* export */
	
	return new View({
		name		: name,
		initialize	: initialize,
		finalize	: finalize,
		render		: render,
		components	: components
	});

});