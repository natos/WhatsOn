/* 
* ProgrammeModel
* --------------
*
* Emit events every time data changes
*
*/

define([

	'config/programme',
	'lib/flaco/model'

], function ProgrammeModelContext(config, Model) {

	var name = 'programme';

/* private */

/* public */

/* export */

	return new Model({
		name	: name,
		event	: config.MODEL_CHANGED
	});

});