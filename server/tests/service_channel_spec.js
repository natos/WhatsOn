var requirejs = require('requirejs');

/**
 * require configuration.
 */

requirejs.config({
    baseUrl: 'server',
    nodeRequire: require
});

requirejs([

	'services/channel'

],

function(ChannelService) {

	/** Setup */

	var channelService = new ChannelService();

	describe("Channel Service Integrity", function() {

		it('should instantiate a Channel Service Object', function() {

			expect(channelService instanceof ChannelService).toBeTruthy();

		});


		describe('getChannels method', function() {

			it('should be defined', function() {

				expect(channelService.getChannels).toBeTruthy();

			});

			it('should return the instance of itself once executed', function() {

				expect(channelService.getChannels()).toEqual(channelService);

			});

			it('should response as an async service', function() {

				var done = false, channels, finish = function() { return done; };

				// getDetails
				channelService.once('getChannels', function(_channels) {

					// globalize
					channels = _channels;

					// release the test
					// wierd sync stuff
					done = true;

				}).getChannels();

				waitsFor(function() {

					// that wierd stuff being wierd
					return finish();

					// Timeout
				}, "Channel Service never responded", 10000);

				// Async assertions
				runs(function() {

					expect(typeof channels).toEqual('object'); // actually an array

					expect(channels.length).toBeGreaterThan(0);

				});

			});

		});


		describe('getDetails method', function() {

			it('should be defined', function() {

				expect(channelService.getDetails).toBeTruthy();

			});

			it('should return the instance of itself once executed', function() {

				expect(channelService.getDetails()).toEqual(channelService);

			});

			it('should response as an async service', function() {

				var id = 1, done = false, error, response, body, finish = function() { return done; };

				// getDetails
				channelService.once('getDetails', function(_error, _response, _body) {

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
				}, "Channel Service never responded", 10000);

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

				expect(channelService.getEvents).toBeTruthy();

			});

			it('should return the programmeService instance once executed', function() {

				expect(channelService.getEvents()).toEqual(channelService);

			});

			it('should response as an async service', function() {

				var id = 1, done = false, error, response, body, finish = function() { return done; };

				channelService.once('getEvents', function(_error, _response, _body) {

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
				}, "Channel Service never responded", 10000);

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