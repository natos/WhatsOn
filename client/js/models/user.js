/* 
* UserModel
* ---------
*
* Emit events every time data changes
*
*/

define([

	'config/user',
	'lib/flaco/model'

], function UserModelContext(u, Model) {

	var name = 'user';

/* private */

/* public */

/* export */

	return new Model({
		name	: name,
		event	: u.MODEL_CHANGED
	});

});