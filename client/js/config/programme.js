/* 
* ProgrammeConfig
* --------------
*
* Constants and configurations for Programme Views
*
*/

define([], function ProgrammeConfig() {

/* private */

/* public */

/* @class ProgrammeConfig */
	return {

		// Events

		RECORD: 'programme:record',

		FAVORITE: 'programme:favorite',

		// DOM Access

		$window: $(window),
	
		$body: $(document.body),

		$userAction: $('#user-action'),		

		$record: $('.record'),

		$favorite: $('.favorite')

	};

});