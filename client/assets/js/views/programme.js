/* 
* ProgrammeView
* --------------
*
* Controlls programme page
*
*/
define([
	
	'config/app',
	'config/user',
	'config/programme',
	'modules/app',
	'controllers/programme'

], function ProgrammeView(c, u, p, App, ProgrammeController) {

/* private */

	var url = $('meta[property="og:url"]').attr('content'),

		$userAction = $('#user-action');

	/* constructor */
	function initialize() {

		$userAction.on('click', userActionHandler);

		App.emit(c.VIEW_LOADED);

		App.on(u.MODEL_CHANGED, handleUserModelChange);
	
	};

	function userActionHandler(event) {

		if ( /disable/.test(event.target.className) ) {
			
			return;
		}

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

	};

	function handleUserModelChange(event) {

		var favorites, t;

		if (event['favorites']) {

			favorites = event['favorites'].data;

			t = favorites.length;

			while (t--) {
				if (favorites[t].data.tv_show.url === window.location.href) {
					p.$favorite.addClass('disable');
				}
			}
			
		}

	};

/* public */

/* @class ProgrammeView */
	return {
		initialize: initialize
	}
});