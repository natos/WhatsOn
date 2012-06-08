/* 
* ChannelView
* -----------
*
* Controlls channel page
*
*/
define([
	
	'config/app',
	'modules/app',
	'lib/flaco/view'

], function ChannelView(a, App, View) {

	var name = 'channel';

/* public */

	function initialize() {

		App.loadCss('/assets/css/channelpage.css');
		App.loadCss('/assets/css/channel-event-list.css');

		return this;
	
	};

	function render() {

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