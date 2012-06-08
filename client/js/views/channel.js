/* 
* ChannelView
* -----------
*
* Controlls channel page
*
*/
define([
	
	'config/app',
	'config/user',
	'config/channel',
	'modules/app',
	'lib/flaco/view',

], function ChannelViewScope(a, u, c, App, View) {

	var name = 'channel';

/* private */

	var url = $('meta[property="og:url"]').attr('content');

	function handleUserModelChanges(event) {

		var channels, t, id;

		if (event['channels']) {

			channels = event['channels'].data;

			t = channels.length;

			while (t--) {
				// if the ID of the show is in my favorite list, disable the favorite button;
				if (channels[t].data.tv_show.url === url) {
					$('#user-action').find('.favorite').attr('disable','disable').addClass('disable');
				}
			}
			
		}

	};

	function userActionHandler(event) {

		if ( /disable/.test(event.target.className) ) {			
			console.log('disable');
			return;
		}

		switch (event.target.className) {

			case 'favorite': favorite(); break;

		}

	};

	/* ACTIONS */

	function favorite() {

		App.emit(c.FAVORITE, url);

	};

/* public */

	function initialize() {

		App.loadCss('/assets/css/channelpage.css');
		App.loadCss('/assets/css/channel-event-list.css');

		App.on(u.MODEL_CHANGED, handleUserModelChanges);

		return this;
	
	};


	function render() {

		c.$userAction = $('#user-action').on('click', userActionHandler);

		return this;

	};

	function finalize() {

		return this;

	};

/* export */

	return new View({
		name: name,
		render: render,
		finalize: finalize,
		initialize: initialize
	});
});