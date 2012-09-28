require.config({
/* ... */
});


require([

	'modules/app'

],
function(App) {

	/* safe console */
	if (!window.console || !window.console.log) {
		window.console = {
			assert: function(){},
			log: function(){},
			warn: function(){},
			error: function(){},
			debug: function(){},
			dir: function(){},
			info: function(){}
		};
	}

	/* global signature */
	window.upc = App.initialize();
	window.app = App;

});