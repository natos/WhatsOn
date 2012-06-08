/* 
* ChannelController
* ------------------
*
*/

define([

	'config/app',
	'config/channel',
	'modules/app',
	'lib/flaco/controller',
	'views/channel'

], function ChannelControllerScope(a, c, App, Controller, ChannelView) {

	var name = 'channel';

/* private */

	function favorite(url) {

		FB.api('/me/upcsocial:favorite', 'post', { tv_channel: url }, function(response) {

			console.log('channel favoritered');
			console.log(response);

		});
	};

/* public */

	function initialize() {

		App.on(c.FAVORITE, favorite);

		return this;

	};

	function finalize() {

		return this;

	};


/* export */

	return new Controller({
		name: name,
		view: ChannelView,
		finalize: finalize,
		initialize: initialize
	});

});