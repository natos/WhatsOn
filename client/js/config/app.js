/* 
* AppConfig
* --------------
*
* Constants and configurations for App
*
*/
define([], function AppConfigContext() {

/* private */

/* public */

/* export */

	return {

		/* constants */ 

		NAMESPACE: 'upsocial',

		/* events */

		NAVIGATE: 'app:navigate',

		// controllers

		CONTROLLER_INITIALIZING: 'app:controller_initializing',

		CONTROLLER_INITIALIZED: 'app:controller_initialized',

		CONTROLLER_FINALIZING: 'app:controller_finalizing',

		CONTROLLER_FINALIZED: 'app:controller_finalized',

		// views

		VIEW_INITIALIZING: 'app:view_initializing',

		VIEW_INITIALIZED: 'app:view_initialized',

		VIEW_FINALIZING: 'app:view_fnalizing',

		VIEW_FINALIZED:	'app:view_finalized',

		VIEW_RENDERING: 'app:view_rendering',

		VIEW_RENDERED: 'app:view_rendered',

		/* DOM access */

		$window: $(window),
	
		$body: $(document.body),

		$main: $('#main'),

		$content: $('#content'),

		$transition: $('#transition')

	};

});