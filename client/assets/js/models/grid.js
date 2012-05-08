/* 
* GridModel
* --------------
*
* Emit events every time data changes
*
*/

define([

	'config/grid'

], function(g) {

/* private */


/* @class GridModel */
var GridModel = {

};

	/* constructor */
	GridModel.initialize = function() { return this; };

	/* global setter */
	GridModel.set = function(key, value) {

		var obj = {};
		obj[key] = value;
		this[key] = value;

		upc.emit(g.MODEL_CHANGED, obj );

	};
	return GridModel;

});