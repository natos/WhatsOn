/* 
* NowAndNextView 
* -------------
*
*/

define([

	'config/app',
	'modules/app',
	'lib/flaco/view'

], function NowAndNextViewContext(a, App, View) {

	var name = 'nowandnext';

/* private */

/* public */

/* abstract */

	var channelsListContainer;

	function initialize() {

		App.loadCss('/assets/css/nowandnext.css');
		App.loadCss('/assets/css/channel-event-list.css');

		return this;

	}

	function render() {

		channelsListContainer = $('#nowandnext-content');

		// Observe clicks on 'earlier' and 'later' links,
		// and use ajax to replace the channels list content
		channelsListContainer.on('click', 'a.earlier, a.later, a.group', function(e) {
			e.preventDefault();
			e.stopPropagation();
			channelsListContainer.load(e.target.href);
		});

		return this;

	}

	function finalize() {

		channelsListContainer.off('click');

		return this;
	}


/* export */

	return new View({
		name		: name,
		initialize	: initialize,
		finalize	: finalize,
		render		: render
	});

});