/**
 * Simple Ajax loader script for the now-and-next page, for browsers that don't boot the HTML5 app.
 */
(function(){
	if (!window.mustard) {

		var $channelsListContainer = $('#nowandnext-content');

		// Observe clicks on 'earlier' and 'later' links,
		// and use ajax to replace the page body content
		$channelsListContainer.on('click', 'a.earlier, a.later, a.group', function(e) {
			e.preventDefault();
			e.stopPropagation();
			$channelsListContainer.load(e.target.href);
		});

	}

})()
