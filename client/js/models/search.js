/* 
* SearchModel
* --------------
*
* Emit events every time data changes
*
*/

define([

	'config/search',
	'lib/flaco/model'

], function SearchModelContext(searchConfig, Model) {

	var name = 'search';

/* private */

/* public */

/* export */

	return new Model({
		name	: name,
		event	: searchConfig.MODEL_CHANGED
	});

});