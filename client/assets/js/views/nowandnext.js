/* 
* NowAndNextView 
* -------------
*
*/

define([

	'config/app',
	'controllers/app'

], function NowAndNextView(c, App) {

/* private */

	var channelsListContainer = $('#channels-list-container');

	/* constructor */
	function initialize() {

		/** 
		*	Events handlers
		*/

		// Observe clicks on 'earlier' and 'later' links,
		// and use ajax to replace the channels list content
		channelsListContainer.on('click', 'a.earlier, a.later', function(e) {
			e.preventDefault();
			e.stopPropagation();
			channelsListContainer.load(e.target.href);
		});

		App.emit(c.VIEW_LOADED, this);

		return this;

	};

/* public */
	return {
		initialize: initialize
	};

});