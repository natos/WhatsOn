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

		VIEW_LOADED: 'app:view_loaded',

		VIEW_RENDERED: 'app:view_rendered',
	
		// DOM Access

		$window: $(window),
	
		$body: $(document.body),

		$content: $('#content'),

		$transition: $('#transition')

	};

});