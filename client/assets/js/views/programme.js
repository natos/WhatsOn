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

], function ProgrammeView(a, u, p, App, ProgrammeController) {

	/* private */

	var url = $('meta[property="og:url"]').attr('content'),

		$userAction = $('#user-action');

	/**
	 * Load the content for the view.
	 * Activate associated components.
	 * Set up event handlers.
	 * @public
	 */
	function initialize(params) {

		var programmeId = params.programmeId;

		// And if is already loaded?
		App.loadCss('/assets/css/programmepage.css');

		$('#content').load('/programme/' + programmeId, function(data, status, xhr){
			App.emit(a.VIEW_LOADED);
		});

		$userAction.on('click', userActionHandler);

		App.emit(a.VIEW_LOADED);

		App.on(u.MODEL_CHANGED, handleUserModelChange);
	
	};

	/**
	 * If necessary, remove the content for the view from the DOM.
	 * Deactivate associated components. 
	 * Clean up event handlers.
	 * @public
	 */
	function finalize() {

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


	/* @class ProgrammeView */
	return {
		initialize: initialize,
		finalize: finalize
	}
});