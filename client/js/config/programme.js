/* 
* ProgrammeConfig
* --------------
*
* Constants and configurations for Programme Views
*
*/

define([], function ProgrammeConfigContext() {

/* private */

/* public */

/* export */

	return {

		/* Events */

		RECORD: 'programme:record',

		SHARE: 'programme:share',

		ADD_FAVORITE: 'programme:add_favorite',

		REMOVE_FAVORITE: 'programme:remove_favorite',

		/* DOM Access */

		$window: $(window),
	
		$body: $(document.body),

		$userAction: $('#user-action'),		

		$record: $('.record'),

		$favorite: $('.favorite')

	};

});