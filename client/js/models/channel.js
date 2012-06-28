/* 
* ChannelModel
* --------------
*
* Emit events every time data changes
*
*/

define([

	'config/channel',
	'lib/flaco/model'

], function ChannelModelContext(c, Model) {

	var name = 'channel';

/* private */

/* public */

/* export */

	return new Model({
		name	: name,
		event	: c.MODEL_CHANGED
	});

});