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

	function initialize() {

		App.loadCss('/assets/css/nowandnext.css');
		App.loadCss('/assets/css/channel-event-list.css');

		return this;

	}

	function render() {

		return this;

	}

	function finalize() {

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