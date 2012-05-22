require.config({
/* ... */
});


// Cutting the mustard: detect whether the user gets the rich client experience
// TODO: load zepto for mustard and jquery for mayo?
var mustard = ('querySelector' in document && 'localStorage' in window && 'addEventListener' in window);

// Allow mustard to be turned off for testing:
// add a "?mustard=0" or "?mustard=false" querystring
var href = location.href.toUpperCase();
if (href.indexOf('MUSTARD=0')>0 || href.indexOf('MUSTARD=FALSE')>0) {
	mustard = false;
}

console.log('mustard = ' + mustard);

if (mustard) {
	document.documentElement.className = document.documentElement.className.replace('no-mustard', 'mustard');

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
