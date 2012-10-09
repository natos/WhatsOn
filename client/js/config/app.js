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

		API_PREFIX: 'http://api.lgi.com/alpha',

		CONTROLLERS: ['dashboard','grid','nowandnext','search'/*,'not-found'*/],

		/* labels */

		SCHEDULES_CACHE: 'schedules_cache',

		COUNTRIES_CACHE: 'countries_cache',

		CATEGORIES_CACHE: 'categories_cache',

		GENRES_CACHE: 'genres_cache',

		LINEUP_CACHE: 'lineup_cache',

		/* events */

		READY: 'app:ready',

		ACTION: 'app:action',

		VOID: 'app:action:void',

		NAVIGATE: 'app:navigate',

		MODEL_CHANGED: 'app:model_changed',

		GENRES_RECEIVED: 'app:genres_received',

		LINEUP_RECEIVED: 'app:lineup_received',

		COUTRIES_RECEIVED: 'app:countries_received',

		SCHEDULES_RECEIVED: 'app:schedules_received',

		CATEGORIES_RECEIVED: 'app:categories_received',

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

		// Localization

		selectedLanguageCode: 'nl',

		/* DOM access */

		// TODO: REMOVE THIS THINGS
		_doc: document,

		_win: window,

		_body: document.body,

		_main: document.getElementById('main'),

		_content: document.getElementById('content')

	};

});