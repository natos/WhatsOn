/* 
* ProgrammeView
* --------------
*
* Controlls programme page
*
*/
define([
	
	'config/app',
	'config/programme',
	'controllers/app',
	'controllers/programme'

], function ProgrammeView(c, p, App, ProgrammeController) {

/* private */

	var url = $('meta[property="og:url"]').attr('content');

	/* constructor */
	function initialize() {

		$('#user-action').on('click', userActionHandler);

		App.emit(c.VIEW_LOADED);
	
	};

	function userActionHandler(event) {

		switch (event.target.className) {

			case 'record': record(); break;

			case 'favorite': favorite(); break;

		}

	};

	function record() {

		upc.emit(p.RECORD, url);

	};

	function favorite() {

		upc.emit(p.FAVORITE, url);

	}

/* public */

/* @class ProgrammeView */
	return {
		initialize: initialize
	}
});