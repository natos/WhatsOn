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

		// DOM Access

		$window: $(window),
	
		$body: $(document.body)

	};

});