/* 
* GridModel
* --------------
*
* Emit events every time data changes
*
*/

define([

	'config/grid'

], function GridModel(g) {

/* private */

	function initialize() { 
		return this; 
	};
	
	function set(key, value) {
	
		var obj = {};
		obj[key] = value;
		this[key] = value;
	
		upc.emit(g.MODEL_CHANGED, obj );
	}

/* public */

/* @class GridModel */
	return {
		/* constructor */
		initialize: initialize,
		/* global setter */
		set: set
	};

});