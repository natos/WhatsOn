/* 
* ProgrammeController
* ------------------
*
*/

define([

	'config/app',
	'controllers/app',
	'views/programme'

], function ProgrammeController(c, App, ProgrammeView) {

/* private */

	function initialize() {

		// Let the App know your here
		App.controllers.programme = this;
	
		return this;
	
	};

/* public */
	return {
		/* constructor */
		initialize: initialize,
		view: ProgrammeView.initialize()
	};

});