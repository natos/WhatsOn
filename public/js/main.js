require.config({
/* ... */
});

var wo = {
	views: {}
};

require([	

	'app'
,	'http://connect.facebook.net/en_US/all.js'

], 
function(App) {

	App.initialize();

});