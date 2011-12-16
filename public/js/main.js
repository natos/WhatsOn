require.config({

});

var wo = {
	views: {}
};

require([	

	'app'

,	'js/libs/backbone/backbone.js'
,	'js/libs/socket.io/socket.io.js'

], 
function(App){

	App.initialize();

});