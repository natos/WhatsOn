require.paths.unshift(__dirname + '/lib');

/**
 * module dependencies.
 */
var fs = require('fs')
,	util   = require('util')
,	express = require('express')
,	everyauth = require('everyauth')
,	uuid = require('node-uuid')
,	FacebookClient = require('facebook-client').FacebookClient
,	port = process.env.PORT || 3000;

var facebook = new FacebookClient();

// configure facebook authentication
everyauth.facebook
  .appId(process.env.FACEBOOK_APP_ID)
  .appSecret(process.env.FACEBOOK_SECRET)
  .scope('user_likes,user_photos,user_photo_video_tags')
  .entryPath('/login')
  .redirectPath('/#nowandnext')
  .findOrCreateUser(function() {
    return({});
  })

/**
 * app configuration.
 */
var app = express.createServer(
	express.logger(),
	express.static(__dirname + '/public'),
	express.cookieParser(),
	// set this to a secret value to encrypt session cookies
	express.session({ secret: process.env.SESSION_SECRET || '47a04d4b4c794097717593854b7a4e36' }),
	// insert a middleware to set the facebook redirect hostname to http/https dynamically
	function(request, response, next) {
		var method = request.headers['x-forwarded-proto'] || 'http';
		everyauth.facebook.myHostname(method + '://' + request.headers.host);
		next();
	},
	everyauth.middleware(),
	require('facebook').Facebook()
);

app.configure(function(){

	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));

	app.set('view engine', 'jade');
	app.set('views', __dirname + '/views');
	app.set("view options", { layout: false });

	// make a custom html template
	/*
	app.register('.html', {
		compile: function(str, options) {
		return function(locals) {
			return str;
		};
	}
	});
	*/
});

app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
	app.use(express.errorHandler()); 
});

/**
 * app start
 */

app.listen(port, function() {
	/**
	 * log
	 */
	console.log("Express server listening on port %d", app.address().port);
});


/**
 * Socket IO.
 */
// create a socket.io backend for sending facebook graph data
// to the browser as we receive it
var io = require('socket.io').listen(app);

// wrap socket.io with basic identification and message queueing
// code is in lib/socket_manager.js
var socket_manager = require('socket_manager').create(io);

// use xhr-polling as the transport for socket.io
io.configure(function () {
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 10);
});


/**
 * Routing
 */

// respond to GET /home
app.get('/home', function(request, response) {

  // detect the http method uses so we can replicate it on redirects
  var method = request.headers['x-forwarded-proto'] || 'http';

  // if we have facebook auth credentials
  if (request.session.auth) {

    // initialize facebook-client with the access token to gain access
    // to helper methods for the REST api
    var token = request.session.auth.facebook.accessToken;
    facebook.getSessionByAccessToken(token)(function(session) {

      // generate a uuid for socket association
      var socket_id = uuid();

      // query 4 friends and send them to the socket for this socket id
      session.graphCall('/me/friends&limit=4')(function(result) {
        result.data.forEach(function(friend) {
          socket_manager.send(socket_id, 'friend', friend);
        });
      });

      // query 16 photos and send them to the socket for this socket id
      session.graphCall('/me/photos&limit=16')(function(result) {
        result.data.forEach(function(photo) {
          socket_manager.send(socket_id, 'photo', photo);
        });
      });

      // query 4 likes and send them to the socket for this socket id
      session.graphCall('/me/likes&limit=4')(function(result) {
        result.data.forEach(function(like) {
          socket_manager.send(socket_id, 'like', like);
        });
      });

      // use fql to get a list of my friends that are using this app
      session.restCall('fql.query', {
        query: 'SELECT uid, name, is_app_user, pic_square FROM user WHERE uid in (SELECT uid2 FROM friend WHERE uid1 = me()) AND is_app_user = 1',
        format: 'json'
      })(function(result) {
        result.forEach(function(friend) {
          socket_manager.send(socket_id, 'friend_using_app', friend);
        });
      });

      // get information about the app itself
      session.graphCall('/' + process.env.FACEBOOK_APP_ID)(function(app) {

        // render the home page
        response.render('home.ejs', {
          layout:   false,
          token:    token,
          app:      app,
          user:     request.session.auth.facebook.user,
          home:     method + '://' + request.headers.host + '/',
          redirect: method + '://' + request.headers.host + request.url,
          socket_id: socket_id
        });

      });
    });

  } else {

    // not authenticated, redirect to / for everyauth to begin authentication
    response.redirect('/login');

  }
});


/*

All your watch actions

curl 'https://graph.facebook.com/me/video.watches?access_token=AAACLcMgBBscBAL1Y4ZBUaiChpKO39SRQBtDaSZAafJLKVgaSZC0M9bAd2vLFN2ZCDD1du0lcUe8I83yTC3V66zxKLlviKtJLEeTyHZC7StQZDZD'

Add a watch

curl -F 'access_token=AAACLcMgBBscBAL1Y4ZBUaiChpKO39SRQBtDaSZAafJLKVgaSZC0M9bAd2vLFN2ZCDD1du0lcUe8I83yTC3V66zxKLlviKtJLEeTyHZC7StQZDZD' \
     -F 'movie=http://example.com' \
        'https://graph.facebook.com/me/video.watches'
*/


// index
app.get('/', function(req, res) {

	// generate a uuid for socket association
	var socket_id = uuid();

	var meta = {
		app:      { title: 'Whats On!', id: process.env.FACEBOOK_APP_ID }
	,	socket_id: socket_id
	}

	// detect the http method uses so we can replicate it on redirects
	var method = req.headers['x-forwarded-proto'] || 'http';

	// if we have facebook auth credentials
	if (req.session.auth) {

		// initialize facebook-client with the access token to gain access
		// to helper methods for the REST api
		var token = req.session.auth.facebook.accessToken;

		facebook.getSessionByAccessToken(token)(function(session) {

			// get information about the app itself
			session.graphCall('/' + process.env.FACEBOOK_APP_ID)(function(app) {

console.log(req.session.auth.facebook.user)

				res.render('index', {
					layout:   false
				,	token:    token
				,	app:      app
				,	user:     'asdas'//dreq.session.auth.facebook.user
				,	home:     method + '://' + req.headers.host + '/'
				,	redirect: method + '://' + req.headers.host + req.url
				,	socket_id: socket_id
				});

			});
		});

	} else {
    	// not authenticated, redirect to / for everyauth to begin authentication
    	res.redirect('/login');
	}

});