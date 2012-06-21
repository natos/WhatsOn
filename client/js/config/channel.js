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

		ADD_FAVORITE: 'channel:add_favorite',

		REMOVE_FAVORITE: 'channel:remove_favorite',

		/* DOM Access */

		$window: $(window),
	
		$body: $(document.body),

		$userAction: $('#user-action'),		

		$record: $('.record'),

		$favorite: $('.favorite')

	};

});