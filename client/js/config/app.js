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

		ROOT_URL: 'http://upcsocial.herokuapp.com/',

		/* events */

		NAVIGATE: 'app:navigate',

		ACTION: 'app:action',

		VOID: 'app:action:void',

		// controllers

		CONTROLLER_INITIALIZING: 'app:controller_initializing',

		CONTROLLER_INITIALIZED: 'app:controller_initialized',

		CONTROLLER_FINALIZING: 'app:controller_finalizing',

		CONTROLLER_FINALIZED: 'app:controller_finalized',

		// views

		VIEW_INITIALIZING: 'app:view_initializing',

		VIEW_INITIALIZED: 'app:view_initialized',

		VIEW_FINALIZING: 'app:view_finalizing',

		VIEW_FINALIZED:	'app:view_finalized',

		VIEW_RENDERING: 'app:view_rendering',

		VIEW_RENDERED: 'app:view_rendered',

		/* DOM access */

		_doc: document,

		_win: window,

		_body: document.body,

		_main: document.getElementById('main'),

		_content: document.getElementById('content')

	};

});