/**
 *	MoviesService
 */

define([

	/** @require */

	//modules
	'util',
	'events',
	'request',

	// config
	'config/global.config',

	// mock
	'mocks/topmovies'

],


/**
 *	@class MoviesService
 */

function(util, events, request, config, TOP_MOVIES_MOCK) {

	/** @constructor */

	var MoviesService = function() {

		/** @borrow EventEmitter.constructor */ 
		events.EventEmitter.call(this);

		return this;

	};

	/** @inherits EventEmitter */
	util.inherits(MoviesService, events.EventEmitter);


	/** @private */

	var TOP_MOVIES_MOCK = JSON.stringify(TOP_MOVIES_MOCK); // emulating a text response

	/** @public */

	/** Get list of top movies */
	MoviesService.prototype.getTopMovies = function() {

		var self = this;

			self.emit('getTopMovies', '', '', TOP_MOVIES_MOCK);


		return this;
	};

	/** @return */

	return MoviesService;

});