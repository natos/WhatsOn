var requirejs = require('requirejs');

/**
 * require configuration.
 */

requirejs.config({
    baseUrl: 'server',
    nodeRequire: require
});

requirejs([

	'utils/dateutils'

],

function(DateUtils) {


	describe("Basic integrity tests", function() {

		var dateUtils = new DateUtils();

		it('should instantiate a Channel Service Object', function() {

			expect(dateUtils instanceof DateUtils).toBeTruthy();

		});

		it('should have all its methods', function() {

			expect(dateUtils.prettify).toBeTruthy();

			expect(typeof dateUtils.prettify).toEqual('function');

			expect(dateUtils.now).toBeTruthy();

			expect(typeof dateUtils.now).toEqual('function');


		});


		it('should set as "now" a valid date and return the instance object', function() {

			var randomDate = '2012-04-13T10:00Z';

			var dateUtilsIntance = dateUtils.now(randomDate);

			expect(dateUtilsIntance).toEqual(dateUtils);

			expect(typeof dateUtils.now()).toEqual('object');

			expect(dateUtils.now()).toEqual( new Date(randomDate) );

		});

		it('should return a string', function() {

			var randomDate = '2012-04-13T10:00Z';

			expect(typeof dateUtils.prettify(randomDate)).toEqual('string');

		});

	});

/**
 * Prettify Check!
 */

/**
 * Just now
 */
	describe("Just Now", function() {

		it('should return "just now"', function() {

			var from = '2012-04-13T10:00Z';

			var dateUtils = new DateUtils().now(from);

			var prittydate = dateUtils.prettify(from);

			expect(prittydate).toEqual('just now');

		});

	});


/**
 * Past
 */

	describe("Testing past minutes", function() {

		it('should return "1 minute ago"', function() {

			var from = '2012-04-13T10:01Z';

			var date = '2012-04-13T10:00Z';

			var dateUtils = new DateUtils().now(from);

			var prittydate = dateUtils.prettify(date);

			expect(prittydate).toEqual('1 minute ago');

		});

		it('should return "5 minutes ago"', function() {

			var from = '2012-04-13T10:05Z';

			var date = '2012-04-13T10:00Z';

			var dateUtils = new DateUtils().now(from);

			var prittydate = dateUtils.prettify(date);

			expect(prittydate).toEqual('5 minutes ago');

		});

	});

	describe("Testing past hours", function() {

		it('should return "1 hour ago"', function() {

			var from = '2012-04-13T11:00Z';

			var date = '2012-04-13T10:00Z';

			var dateUtils = new DateUtils().now(from);

			var prittydate = dateUtils.prettify(date);

			expect(prittydate).toEqual('1 hour ago');

		});

		it('should return "2 hours ago"', function() {

			var from = '2012-04-13T12:00Z';

			var date = '2012-04-13T10:00Z';

			var dateUtils = new DateUtils().now(from);

			var prittydate = dateUtils.prettify(date);

			expect(prittydate).toEqual('2 hours ago');

		});

		it('should return "5 hours ago"', function() {

			var from = '2012-04-13T15:00Z';

			var date = '2012-04-13T10:00Z';

			var dateUtils = new DateUtils().now(from);

			var prittydate = dateUtils.prettify(date);

			expect(prittydate).toEqual('5 hours ago');

		});

	});

	describe("Testing past days", function() {

		it('should return "yesterday"', function() {

			var from = '2012-04-14T10:00Z';

			var date = '2012-04-13T10:00Z';

			var dateUtils = new DateUtils().now(from);

			var prittydate = dateUtils.prettify(date);

			expect(prittydate).toEqual('yesterday');

		});

		it('should return "2 days ago"', function() {

			var from = '2012-04-17T10:00Z';

			var date = '2012-04-15T10:00Z';

			var dateUtils = new DateUtils().now(from);

			var prittydate = dateUtils.prettify(date);

			expect(prittydate).toEqual('2 days ago');

		});

		it('should return "5 days ago"', function() {

			var from = '2012-04-20T10:00Z';

			var date = '2012-04-15T10:00Z';

			var dateUtils = new DateUtils().now(from);

			var prittydate = dateUtils.prettify(date);

			expect(prittydate).toEqual('5 days ago');

		});

	});

	describe("Testing past weeks", function() {

		it('should return "a week ago"', function() {

			var from = '2012-04-20T10:00Z';

			var date = '2012-04-13T10:00Z';

			var dateUtils = new DateUtils().now(from);

			var prittydate = dateUtils.prettify(date);

			expect(prittydate).toEqual('a week ago');

		});

		it('should return "2 weeks ago"', function() {

			var from = '2012-04-27T10:00Z';

			var date = '2012-04-13T10:00Z';

			var dateUtils = new DateUtils().now(from);

			var prittydate = dateUtils.prettify(date);

			expect(prittydate).toEqual('2 weeks ago');

		});

		it('should return "5 weeks ago"', function() {

			var from = '2012-05-18T10:00Z';

			var date = '2012-04-13T10:00Z';

			var dateUtils = new DateUtils().now(from);

			var prittydate = dateUtils.prettify(date);

			expect(prittydate).toEqual('5 weeks ago');

		});

	});

/**
 * Future
 */

	describe("Testing future minutes", function() {

		it('should return "within 1 min"', function() {

			var from = '2012-04-13T10:00Z';

			var date = '2012-04-13T10:01Z';

			var dateUtils = new DateUtils().now(from);

			var prittydate = dateUtils.prettify(date);

			expect(prittydate).toEqual('within 1 minute');

		});

		it('should return "within 5 minutes"', function() {

			var from = '2012-04-13T10:00Z';

			var date = '2012-04-13T10:05Z';

			var dateUtils = new DateUtils().now(from);

			var prittydate = dateUtils.prettify(date);

			expect(prittydate).toEqual('within 5 minutes');

		});

	});

	describe("Testing future hours", function() {

		it('should return "within 1 hour"', function() {

			var from = '2012-04-13T10:00Z';

			var date = '2012-04-13T11:00Z';

			var dateUtils = new DateUtils().now(from);

			var prittydate = dateUtils.prettify(date);

			expect(prittydate).toEqual('within 1 hour');

		});

		it('should return "within 2 hours"', function() {

			var from = '2012-04-13T10:00Z';

			var date = '2012-04-13T12:00Z';

			var dateUtils = new DateUtils().now(from);

			var prittydate = dateUtils.prettify(date);

			expect(prittydate).toEqual('within 2 hours');

		});

		it('should return "within 5 hours"', function() {

			var from = '2012-04-13T10:00Z';

			var date = '2012-04-13T15:00Z';

			var dateUtils = new DateUtils().now(from);

			var prittydate = dateUtils.prettify(date);

			expect(prittydate).toEqual('within 5 hours');

		});

	});

	describe("Testing future days", function() {

		it('should return "tomorrow"', function() {

			var from = '2012-04-13T10:00Z';

			var date = '2012-04-14T10:00Z';

			var dateUtils = new DateUtils().now(from);

			var prittydate = dateUtils.prettify(date);

			expect(prittydate).toEqual('tomorrow');

		});

		it('should return "within 2 days"', function() {

			var from = '2012-04-13T10:00Z';

			var date = '2012-04-15T10:00Z';

			var dateUtils = new DateUtils().now(from);

			var prittydate = dateUtils.prettify(date);

			expect(prittydate).toEqual('within 2 days');

		});

		it('should return "within 5 days"', function() {

			var from = '2012-04-13T10:00Z';

			var date = '2012-04-18T10:00Z';

			var dateUtils = new DateUtils().now(from);

			var prittydate = dateUtils.prettify(date);

			expect(prittydate).toEqual('within 5 days');

		});

	});

	describe("Testing future weeks", function() {

		it('should return "within a week"', function() {

			var from = '2012-04-13T10:00Z';

			var date = '2012-04-20T10:00Z';

			var dateUtils = new DateUtils().now(from);

			var prittydate = dateUtils.prettify(date);

			expect(prittydate).toEqual('within a week');

		});

		it('should return "within 2 weeks"', function() {

			var from = '2012-04-13T10:00Z';

			var date = '2012-04-27T10:00Z';

			var dateUtils = new DateUtils().now(from);

			var prittydate = dateUtils.prettify(date);

			expect(prittydate).toEqual('within 2 weeks');

		});

		it('should return "within 5 weeks"', function() {

			var from = '2012-04-13T10:00Z';

			var date = '2012-05-18T10:00Z';

			var dateUtils = new DateUtils().now(from);

			var prittydate = dateUtils.prettify(date);

			expect(prittydate).toEqual('within 5 weeks');

		});

	});

});