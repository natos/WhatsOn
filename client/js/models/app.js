/* 
* AppModel
* --------
*
* Emit events every time data changes
*
*/

define([

	'config/app',
	'lib/flaco/model'

], function AppModelContext(a, Model) {

	var name = 'app';

/* private */

/* public */

/* export */

	return new Model({
		name	: name,
		event	: a.MODEL_CHANGED
	});

});