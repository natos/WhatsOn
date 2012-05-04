require.config({
/* ... */
});

require([	

	'controllers/app'

], 
function(App) {

	App.initialize();

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

});