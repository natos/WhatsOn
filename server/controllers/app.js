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
	'controllers/dashboard',
	'controllers/grid',
	'controllers/channel',
	'controllers/programme',
	'controllers/search'

],


/**
 *	@class AppController
 */

function(express, i18n, config, Supports, Dashboard, Grid, Channel, Programme, Search) {

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
			self.server.get('/', globalHandler);
			self.server.get('*.html', globalHandler);

			//	setup app controllers
			self.controllers = {
				dashboard	: new Dashboard(self),
				grid		: new Grid(self),
				channel		: new Channel(self),
				programme	: new Programme(self),
				search		: new Search(self)
			};

		return self;
	};


	/** @private */

	var globalHandler = function(req, res, next) {

		req.isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest';

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