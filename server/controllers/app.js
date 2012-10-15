/**
 *	AppController
 *	Create, configure and handle a Express server
 */

define([

	/** @require */

	// modules
	'request',
	'express',
	'fs',
	'i18n',

	// config
	'config/global.config',

	// utils
	'utils/supports',

	// services

	'services/channel',

	// controllers
	'controllers/login',
	'controllers/dashboard',
	'controllers/grid',
	'controllers/channel',
	'controllers/domain',
	'controllers/programme',
	'controllers/event',
	'controllers/movies',
	'controllers/search',
	'controllers/settings',
	'controllers/nowandnext',
	'controllers/facebook',
	'controllers/admin'
],

function(request, express, fs, i18n, config, Supports, ChannelService, Login, Dashboard, Grid, Channel, Domain, Programme, Event, Movies, Search, Settings, NowAndNext, Facebook, Admin) {

/**
 *	@class AppController
 */

	var AppController = AppControllerConstructor();

	/** @constructor */

	function AppControllerConstructor() {

		/** @public */

		var self = this;

			// load config file
			self.config = config;

			// create server
			self.server = createServer();

			// # Global Routing
			// wildcards: global handler
			// for root and .html files
			self.server.get('*', globalHandler);

			// Redirect to dashboard
			// for requests from root "/"
//			self.server.get('/', redirectToDashboard);

			//	setup app controllers
/*			self.controllers = {
				         login	: new Login(self),
				     dashboard	: new Dashboard(self),
				          grid	: new Grid(self),
				       channel	: new Channel(self),
						domain	: new Domain(self),
				     programme	: new Programme(self),
				         event	: new Event(self),
				        movies	: new Movies(self),
				        search	: new Search(self),
				      settings	: new Settings(self),
				    nowandnext 	: new NowAndNext(self),
				      facebook	: new Facebook(self),
				         admin	: new Admin(self)
			};*/

			// fetch channels
//			new ChannelService().once('getChannels', function saveChannels(channels) {

				// save the channels
//				self.channels = channels;
				var _port = process.argv[2] || process.env.PORT || config.PORT;

				// start the server
				self.server.listen(_port, function listening() {
					console.log("Express server listening on port %d", _port);
					console.log("Express server ready!");
				});

//			}).getChannels();

		return self;

	};


	/** @private */

	function globalHandler(req, res, next) {

		if (!/assets|js|ico/.test(req.url)) {
			res.send(fs.readFileSync('client/index.html', 'utf8'));
		} else {
			next();
		}
	}

	function redirectToDashboard(req, res, next) {

		res.redirect('/dashboard');

	};

	function createServer() {

		var server = express();

			server.configure(function() {
				server.use(server.router);
				server.use(express.bodyParser());
				server.use(express.methodOverride());
				server.set('views', 'server/views');
				server.set('view options', { layout: false });
			});

			server.configure('development', function() {
				server.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
				server.use(express['static']('client'));
			});

			server.configure('production', function() {
				server.use(express.errorHandler());
				server.use(express['static']('client-build')); // The directory /client-build is generated from /client by r.js -- see notes in readme.md
			});

			console.log("Express server starting ...");

		return server;

	};


	/** @public */

	/** @return */

	return AppController;

});