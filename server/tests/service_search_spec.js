var requirejs = require('requirejs');

/**
 * require configuration.
 */

requirejs.config({
    baseUrl: 'server',
    nodeRequire: require
});

requirejs([

	'services/search'

],

function(SearchService) {

	/** Setup */

	var searchService = new SearchService();

	describe("Search Service Integrity", function() {

		it('should instantiate a Search Service Object', function() {

			expect(searchService instanceof SearchService).toBeTruthy();

		});


		describe('Search method', function() {

			it('should be defined', function() {

				expect(searchService.search).toBeTruthy();

			});

			it('should return the instance of itself once executed', function() {

				expect(searchService.search()).toEqual(searchService);

			});

			it('should response as an async service', function() {

				var done = false, error, response, body, finish = function() { return done; };

				// getDetails
				searchService.once('search', function(_error, _response, _body) {

					// globalize
					error = _error;
					response = _response;
					body = _body;

					// release the test
					// wierd sync stuff
					done = true;

				}).search();

				waitsFor(function() {

					// that wierd stuff being wierd
					return finish();

					// Timeout
				}, "Search Service never responded", 10000);

				// Async assertions
				runs(function() {

					expect(error).toBeNull();

					expect(response).toBeTruthy();

					expect(typeof body).toEqual('string');

				});

			});

		});

	}); // end Global describe

});