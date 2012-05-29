/* 
* UserModel
* ---------
*
* Emit events every time data changes
*
*/

define([

	'config/user'

], function UserModel(u) {

/* private */

	function initialize() { 
		return this; 
	};
	
	function set(key, value) {
	
		var obj = {};
		obj[key] = value;
		this[key] = value;
	
		upc.emit(u.MODEL_CHANGED, obj );
	}

/* public */

/* @class UserMode */
	return {
		/* constructor */
		initialize: initialize,
		/* global setter */
		set: set
	};

});