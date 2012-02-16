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

	App.initialize();

});