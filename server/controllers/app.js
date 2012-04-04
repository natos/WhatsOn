/**
 *	AppController
 *	Create, configure and handle a Express server
 */

define([

	/** @require */

	// modules
	'express'
,	'i18n'

	// config
,	'config/global.config'

	// utils
,	'utils/supports'

	// controllers
,	'controllers/dashboard'
,	'controllers/grid'
,	'controllers/channel'
,	'controllers/programme'

],


/**
 *	@class AppController
 */

function(express, i18n, config, Supports, Dashboard, Grid, Channel, Programme) {

	/** @constructor */

	var AppController = function() {

		var self = this;

			// load config file
			self.config = config;

			// create server
			self.server = createServer();

			// wildcards: global handler for .html files
			self.server.get('/', self.globalHandler);
			self.server.get('*.html', self.globalHandler);

			//	setup app controllers
			self.controllers = [

				new Dashboard(self)
			,	new Grid(self)
			,	new Channel(self)
			,	new Programme(self)

			];

		return self;
	};


	/** @private */

	var port = process.env.PORT || 3000;

	var createServer = function() {

		var self = this;

		var server = express.createServer();

			server.configure(function() {
				server.use(server.router);
				server.use(express.bodyParser());
				server.use(express.methodOverride());
				server.use(express.static('client'));
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
			server.listen(port);

			console.log("Express server listening on port %d", server.address().port);

		return server;

	}


	/** @public */

	AppController.prototype.globalHandler = function(req, res, next) {

		req.isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest';

		req.supports = new Supports(req);

		next();

	}


	/** @return */

	return AppController;

});