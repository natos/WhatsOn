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

	window.fbAsyncInit = function() {
		FB.init({
			appId      : '153316508108487', // App ID
			channelUrl : '//localhost:8080/channel.html', // Channel File
			status     : true, // check login status
			cookie     : true, // enable cookies to allow the server to access the session
			oauth      : true, // enable OAuth 2.0
			xfbml      : true  // parse XFBML
		});
		// Additional initialization code here
	};

	// Load the SDK Asynchronously
	(function(d){
		var js, id = 'facebook-jssdk'; if (d.getElementById(id)) {return;}
		js = d.createElement('script'); js.id = id; js.async = true;
		js.src = "//connect.facebook.net/en_US/all.js";
		d.getElementsByTagName('head')[0].appendChild(js);
	}(document));

	App.initialize();

});