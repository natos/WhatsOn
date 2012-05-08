define([

	'config/app',
	'controllers/app'

], function(c, App) {

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

		upc.emit(c.VIEW_LOADED, this);

		return this;

	};

	return NowAndNextView;

});