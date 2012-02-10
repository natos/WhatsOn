require.config({

});

var wo = {
	views: {}
};

require([	

	'app'

,	'js/libs/backbone/backbone.js'
,	'js/libs/iscroll.js'
,	'http://connect.facebook.net/en_US/all.js'

], 
function(App){

	App.initialize();

});