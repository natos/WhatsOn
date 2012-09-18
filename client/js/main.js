require.config({
/* ... */
});


// Cutting the mustard: detect whether the user gets the rich client experience.
// The actual detection is done *as early as possible* using inline script in the
// <head> of the page. We do this to set a 'mustard' classname on the document element
// (like Modernizr).
// TODO: load zepto for mustard and jquery for mayo?
if (console && console.log) { console.log('mustard = ' + window.mustard); }

if (window.mustard) {
	// Boot the rich client

	require([

		'modules/app',
		'/js/utils/requestAnimationFrame.js' // requestAnimationFrame pollyfill

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
window.app = App;

	});

}

// No mustard, no rich client. Classic HTML + CSS + simple JS.


// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());