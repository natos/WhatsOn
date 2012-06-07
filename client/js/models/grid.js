/* 
* GridModel
* --------------
*
* Emit events every time data changes
*
*/

define([

	'config/grid',
	'lib/flaco/model'

], function GridModelContext(g, Model) {

	var name = 'grid';

/* private */

/* public */

/* export */

	return new Model({
		name	: name,
		event	: g.MODEL_CHANGED
	});

});