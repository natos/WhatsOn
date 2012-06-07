/**
 *	AppController
 *	Create, configure and handle a Express server
 */

define([

	/** @require */

	// modules
	'express',
	'i18n',

	// config
	'config/global.config',

	// utils
	'utils/supports',

	// controllers
	'controllers/login',
	'controllers/dashboard',
	'controllers/grid',
	'controllers/channel',
	'controllers/programme',
	'controllers/movies',
	'controllers/search',
	'controllers/settings',
	'controllers/nowandnext',
	'controllers/facebook'
],


/**
 *	@class AppController
 */

function(express, i18n, config, Supports, Login, Dashboard, Grid, Channel, Programme, Movies, Search, Settings, NowAndNext, Facebook) {

	/** @constructor */

	var AppController = function() {

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
			self.server.get('/', function(req, res, next) {
				res.redirect('/dashboard');
			});

			//	setup app controllers
			self.controllers = {
				login		: new Login(self),
				dashboard	: new Dashboard(self),
				grid		: new Grid(self),
				channel		: new Channel(self),
				programme	: new Programme(self),
				movies		: new Movies(self),
				search		: new Search(self),
				settings	: new Settings(self),
				nowandnext 	: new NowAndNext(self),
				facebook	: new Facebook(self)
			};

		return self;
	};


	/** @private */

	var globalHandler = function(req, res, next) {

		res.isJsonp = req.query.callback || null;

		req.supports = new Supports(req);

		next();

	};

	var createServer = function() {

		// not working on version 0.3.0, fixed on 0.3.4
		// but is not available on npm yet
		i18n.configure({ 
			directory: 'server/locales',
			locales:['en', 'nl', 'es'], 
			register: global, 
			debug: true
		});

		var server = express.createServer();

			server.configure(function() {
				server.use(server.router);
				server.use(express.bodyParser());
				server.use(express.methodOverride());
				server.use(express['static']('client')); // static is a reserved word?
				server.use(i18n.init);
				server.set('views', 'server/views');
				server.set('view options', { layout: false });
			});

			server.configure('development', function() {
				server.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
			});

			server.configure('production', function() {
				server.use(express.errorHandler());
			});

			// register i18n helpers for use in templates
			server.helpers({
				__i: i18n.__,
				__n: i18n.__n
			});

			// start the server
			server.listen(process.env.PORT || config.PORT); console.log("Express server listening on port %d", server.address().port);

		return server;

	};


	/** @public */


	/** @return */

	return AppController;

});