var requirejs = require('requirejs');

/**
 * require configuration.
 */

requirejs.config({
    baseUrl: 'server',
    nodeRequire: require
});

requirejs([

	'services/programme'

],

function(ProgrammeService) {

	/** Setup */

	var programmeService = new ProgrammeService();

	describe("Programme Service Integrity", function() {

		it('should instantiate a Programme Service Object', function() {

			expect(programmeService instanceof ProgrammeService).toBeTruthy();

		});

		describe('getDetails method', function() {

			it('should be defined', function() {

				expect(programmeService.getDetails).toBeTruthy();

			});

			it('should return the instance of itself once executed', function() {

				expect(programmeService.getDetails()).toEqual(programmeService);

			});

			it('should response as an async service', function() {

				var id = 1, done = false, error, response, body, finish = function() { return done; };

				// getDetails
				programmeService.once('getDetails', function(_error, _response, _body) {

					// globalize
					error = _error;
					response = _response;
					body = _body;

					// release the test
					// wierd sync stuff
					done = true;

				}).getDetails(id);

				waitsFor(function() {

					// that wierd stuff being wierd
					return finish();

					// Timeout
				}, "Programme Service never responded", 10000);

				// Async assertions
				runs(function() {

					expect(error).toBeNull();

					expect(response).toBeTruthy();

					expect(body).toEqual('An error has occurred');

				});

			});

		});


		describe('getEvents method', function() {

			it('should have defined methods', function() {

				expect(programmeService.getEvents).toBeTruthy();

			});

			it('should return the programmeService instance once executed', function() {

				expect(programmeService.getEvents()).toEqual(programmeService);

			});

			it('should response as an async service', function() {

				var id = 1, done = false, error, response, body, finish = function() { return done; };

				programmeService.once('getEvents', function(_error, _response, _body) {

					// globalize
					error = _error;
					response = _response;
					body = _body;

					// release the test
					// wierd sync stuff
					done = true;

				}).getEvents(id);

				waitsFor(function() {

					// that wierd stuff being wierd
					return finish();

					// Timeout
				}, "Programme Service never responded", 10000);

				// Async assertions
				runs(function() {

					expect(error).toBeNull();

					expect(response).toBeTruthy();

					expect(body).toEqual('An error has occurred');

				});

			});

		}); // end getEvents

	}); // end Global describe

});