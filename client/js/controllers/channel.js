/* 
* ChannelController
* ------------------
*
*/

define([

	'config/app',
	'modules/app',
	'lib/flaco/controller',
	'views/channel'

], function ChannelController(c, App, Controller, ChannelView) {

	var name = 'channel';

/* private */

/* public */

	function initialize() {

		return this;
	
	};

	function finalize() {

		return this;

	};


/* export */

	return new Controller({
		name: name,
		initialize: initialize,
		finalize: finalize,
		view: ChannelView
	});

});