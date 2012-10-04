/* 
* NowAndNextModel
* --------------
*
* Emit events every time data changes
*
*/

define([

	'config/nowandnext',
	'lib/flaco/model'

], function NowAndNextModelContext(config, Model) {

	var name = 'nowandnext';

/* private */

/* public */

/* export */

	return new Model({
		name	: name,
		event	: config.MODEL_CHANGED
	});

});