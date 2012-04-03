require.config({
/* ... */
});

var wo = {
	views: {}
};

require([	

	'app'
,	'//connect.facebook.net/es_LA/all.js#xfbml=1&appId=153316508108487'

], 
function(App) {

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

	App.initialize();

});