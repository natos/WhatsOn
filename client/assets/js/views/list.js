define([
		'controllers/app'
], function(App) {

/* private */

/* @class ListView */
var ListView = {};

	/* constructor */
	ListView.initialize = function() {

		// Let the App know you're here
		App.views.list = this;

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

	return ListView;

});