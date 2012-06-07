/* 
* AppConfig
* --------------
*
* Constants and configurations for App
*
*/
define([], function AppConfig() {

/* private */

/* public */
/* @class AppConfig */
	return {

		// constants

		// events

		NAVIGATE: 'app:navigate',

		CONTROLLER_INITIALIZING: 'app:controller_initializing',

		CONTROLLER_INITIALIZED: 'app:controller_initialized',

		CONTROLLER_FINALIZING: 'app:controller_finalizing',

		CONTROLLER_FINALIZED: 'app:controller_finalized',

		VIEW_INITIALIZING: 'app:view_initializing',

		VIEW_INITIALIZED: 'app:view_initialized',

		VIEW_FINALIZING: 'app:view_fnalizing',

		VIEW_FINALIZED:	'app:view_finalized',

		VIEW_RENDERING: 'app:view_rendering',

		VIEW_RENDERED: 'app:view_rendered',

		// DOM Access

		$window: $(window),
	
		$body: $(document.body),

		$main: $('#main'),

		$content: $('#content'),

		$transition: $('#transition')

	};

});