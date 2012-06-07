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
	'lib/flaco/view',
	'controllers/programme'

], function ProgrammeView(a, u, p, App, View, ProgrammeController) {

	var name = 'programme';

/* private */

	var url = $('meta[property="og:url"]').attr('content');

	function handleUserModelChanges(event) {

		var favorites, t, id;

		if (event['favorites']) {

			favorites = event['favorites'].data;

			t = favorites.length;

			while (t--) {
				// if the ID of the show is in my favorite list, disable the favorite button;
				if (favorites[t].data.tv_show.url === url) {
					$('#user-action').find('.favorite').attr('disable','disable').addClass('disable');
				}
			}
			
		}

	};

	function userActionHandler(event) {

		if ( /disable/.test(event.target.className) ) {			
			console.log('disable');
			return;
		}

		switch (event.target.className) {

			case 'record': record(); break;

			case 'favorite': favorite(); break;

		}

	};

	/* ACTIONS */

	function record() {

		App.emit(p.RECORD, url);

	};

	function favorite() {

		App.emit(p.FAVORITE, url);

	};

/* public */

	/**
	 * Load the content for the view.
	 * Activate associated components.
	 * Set up event handlers.
	 * @public
	 */
	function initialize() {


		// And if is already loaded?
		App.loadCss('/assets/css/programmepage.css');
/*
		$('#content').load('/programme/' + programmeId, function(data, status, xhr){

			p.$userAction = $('#user-action').on('click', userActionHandler);

			App.emit(a.VIEW_RENDERED);

		});
*/
		App.on(u.MODEL_CHANGED, handleUserModelChanges);
	
	};

	function render() {

		p.$userAction = $('#user-action').on('click', userActionHandler);

	};

	/**
	 * If necessary, remove the content for the view from the DOM.
	 * Deactivate associated components. 
	 * Clean up event handlers.
	 * @public
	 */
	function finalize() {

		p.$userAction.off('click', userActionHandler);

		App.off(u.MODEL_CHANGED, handleUserModelChanges);

	};

/* export */
	
	return new View({
		name: name,
		initialize: initialize,
		finalize: finalize,
		render: render
	});
});