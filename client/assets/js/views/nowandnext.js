define([
		'controllers/app'
], function(App) {

/* private */

/* @class NowAndNextView */
var NowAndNextView = {};

	/* constructor */
	NowAndNextView.initialize = function() {

		// Let the App know you're here
		App.views.nowandnext = this;

		/** 
		*	Events handlers
		*/

		// Observe clicks on 'earlier' and 'later' links,
		// and use ajax to replace the channels list content
		$('#channels-list-container').on('click', 'a.earlier, a.later', function(e) {
			e.preventDefault();
			e.stopPropagation();
			$('#channels-list-container').load(e.target.href);
		});

		return this;

	};

	return NowAndNextView;

});