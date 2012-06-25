/* 
* ChannelController
* ------------------
*
*/

define([

	'lib/flaco/controller',
	'views/channel'

], function ChannelControllerScope(Controller, ChannelView) {

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