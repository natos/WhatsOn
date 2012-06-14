require.config({
/* ... */
});


// Cutting the mustard: detect whether the user gets the rich client experience.
// The actual detection is done *as early as possible* using inline script in the
// <head> of the page. We do this to set a 'mustard' classname on the document element
// (like Modernizr).
// TODO: load zepto for mustard and jquery for mayo?
var mustard = (document.documentElement.className.indexOf('no-mustard') < 0) && (document.documentElement.className.indexOf('mustard') >= 0);
if (console && console.log) { console.log('mustard = ' + mustard); }

if (mustard) {
	// Boot the rich client

	require([

		'modules/app'

	],
	function(App) {

		/* safe console */
		if (!window.console || !window.console.log) {
			window.console = {
				assert : function(){},
				log : function(){},
				warn : function(){},
				error : function(){},
				debug : function(){},
				dir : function(){},
				info : function(){}
			};
		}

		/* global signature */
		window.upc = App.initialize();

	});

}

// No mustard, no rich client. Classic HTML + CSS + simple JS.