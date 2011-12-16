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

	window.fbAsyncInit = function() {
		FB.init({
			appId      : '153316508108487', // App ID
			channelUrl : '//upcwhatson.herokuapp.com/channel.html', // Channel File
			status     : true, // check login status
			cookie     : true, // enable cookies to allow the server to access the session
			xfbml      : true  // parse XFBML
		});
	};

	// Load the SDK Asynchronously
	(function(d){
		var js, id = 'facebook-jssdk'; if (d.getElementById(id)) {return;}
		js = d.createElement('script'); js.id = id; js.async = true;
		js.src = "//connect.facebook.net/en_US/all.js";
		d.getElementsByTagName('head')[0].appendChild(js);
	}(document));

});