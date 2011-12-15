require.config({

});

var wo = {
	views: {}
};

require([	

	'app'

,	'js/libs/backbone/backbone.js'

], 
function(App){

	App.initialize();

});