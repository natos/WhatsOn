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
  .entryPath('/')
  .redirectPath('/home')
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

	app.set('views', __dirname + '/views');

	// disable layout
	app.set("view options", { layout: false });

	// make a custom html template
	app.register('.html', {
		compile: function(str, options) {
		return function(locals) {
			return str;
		};
	}
	});
});

app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
	app.use(express.errorHandler()); 
});

/**
 * Routing.
 */

// index
app.get('/', function(req, res) {
	res.render('index.html');
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
    response.redirect('/');

  }
});
