/* 
* ProgrammeView
* --------------
*
* Controlls programme page
*
*/
define([
	
	'config/app',
	'controllers/app'

], function ProgrammeView(c, App) {

/* private */

	/* constructor */
	function initialize() {
	
		App.emit(c.VIEW_LOADED);

/*
curl -F 'access_token=AAAEIbbLOBHEBAPIZCFEBFZBAEtgyyW64c4Y1lfncTdADM7xkojP7OfcxwoVZBxLPE5vfJIq48YH3mxGSQmDvySWAkRODGU0sOXlrEXRhQZDZD' \
     -F 'movie=http://example.com' \
        'https://graph.facebook.com/me/likes'
*/
	
	};

/* public */

/* @class ProgrammeView */
	return {
		initialize: initialize
	}
});