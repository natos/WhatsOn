require.config({
/* ... */
});

window.fbAsyncInit = function() {
	FB.init({
		appId      : '153316508108487',
		status     : true, 
		cookie     : true,
		oauth      : true,
	});
};

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