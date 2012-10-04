/* 
* ChannelController
* ------------------
*
*/

define([

	'config/channel',
	'lib/flaco/controller',
	'modules/event',
	'models/channel',
	'views/channel'

], function ChannelControllerScope(channelConfig, Controller, Event, ChannelModel, ChannelView) {

	var name = 'channel';

/* private */

	var handleApiResponse = function(response) {
		ChannelModel.set('eventsForChannel', response);
	};

/* public */

/* abstract */

	function initialize(state) {

		var channelId = state.parts[0];
		ChannelModel.set('currentChannelId', channelId);

		request = 'http://tvgids.upc.nl/cgi-bin/WebObjects/EPGApi.woa/api/Channel/' + channelId + '/events/NowAndNext.json?order=startDateTime&callback=?';
		$.getJSON(request, handleApiResponse);

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