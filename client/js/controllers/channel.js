/* 
* ChannelController
* ------------------
*
*/

define([

	'config/app',
	'config/user',
	'config/channel',
	'modules/app',
	'modules/user',
	'lib/flaco/controller',
	'views/channel'

], function ChannelControllerScope(a, u, c, App, User, Controller, ChannelView) {

	var name = 'channel';

/* private */

/* public */

/* abstract */

	function initialize() {

		return this;

	}

	function finalize() {

		return this;

	}


/* export */

	return new Controller({
		name		: name,
		initialize	: initialize,
		finalize	: finalize,
		view		: ChannelView
	});

});