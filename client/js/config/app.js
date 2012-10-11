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

		API_PREFIX: 'http://api.lgi.com/alpha',
		
		//API_PREFIX: 'http://62.179.107.149/cgi-bin/WebObjects/ScheduleAPI-trunk-ivy.woa/1/q',

		CONTROLLERS: ['settings','dashboard','grid','nowandnext','search'/*,'not-found'*/],

		DEFAULT_COUNTRY: 'Ireland',

		DEFAULT_LANGUAJE: 'en',

		/* collection labels */

		SCHEDULES_CACHE: 'schedules_cache',

		COUNTRIES_CACHE: 'countries_cache',

		CATEGORIES_CACHE: 'categories_cache',

		GENRES_CACHE: 'genres_cache',

		LINEUP_CACHE: 'lineup_cache',

		/* events names */

		READY: 'app:ready',

		ACTION: 'app:action',

		VOID: 'app:action:void',

		NAVIGATE: 'app:navigate',

		MODEL_CHANGED: 'app:model_changed',

		SELECTED_COUNTRY: 'app:selected_country',

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

		VIEW_RENDERED: 'app:view_rendered'

	};

});