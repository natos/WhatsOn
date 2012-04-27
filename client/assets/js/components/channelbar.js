define([

], function(Grid) {

/* private */

var	$body = $(document.body),

	$channelbar = $('#channels-bar'),

	$channellist = $channelbar.find('ul'),

/* @class ChannelBar */
	ChannelBar = {};

	/* constructor */
	ChannelBar.initialize = function() {

		$body.on('grid:moved', this.move);

		return this;

	};

	ChannelBar.move = function(event) {

		$channellist.css({ 'top': window.pageYOffset * -1 });

	};

	return ChannelBar;

});