/* 
* ChannelConfig
* --------------
*
* Constants and configurations for Programme Views
*
*/

define([], function ChannelConfigContext() {

/* private */

/* public */

/* export */

	return {

		/* Events */

		FAVORITE: 'channel:favorite',

		/* DOM Access */

		$window: $(window),
	
		$body: $(document.body),

		$userAction: $('#user-action'),		

		$record: $('.record'),

		$favorite: $('.favorite')

	};

});