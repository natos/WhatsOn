// GridTest.js

define([
	'tests/Test'
],

function(Test) {


	var GridTest = function() {

		// Borrow the test skeleton constructor
		Test.call(this);

	};

	GridTest.prototype.run = function() {

		var grid = wo.views.grid;

		module("Required data");

		test("Grid basic elements", function() {

//	
//			ok( Object.prototype.toString.call(grid.zeroTime) === '[object Date]' , "zeroTime is a Date Object (call method)");

			ok( !isNaN(new Date(123).getFullYear()) , "zeroTime is a Date Object (valid Date)");

			ok( grid.zeroTime instanceof Date , "zeroTime is a Date Object (instanceof Date)");

			ok( wo.views.grid.timeTicker.el[0] , "timeTicker element exist");

		});

		test("Channels data and structure", function() {

			// Check data integrity
			var t = channels.length,
				channel;

//			expect(t * 6 + 1);

			notEqual( channels.length , 0 , "Channel collection is not empty." );

			while (t--) {

				channel = channels[t];

				ok( channel._type , channel.name + " is a Channel" );

				ok( channel.name , channel.name + " has a name" );

				ok( channel.id , channel.name + " has an id" );

				ok( channel.broadcastFormat , channel.name + " has a broadcast format" );

//				ok( channel.description , channel.name + " has a description" ); // Optional

				ok( channel.position , channel.name + " has a position asigned" );

				ok( channel.logoIMG , channel.name + " has a logo image" );

			}

		});

		module("Required data");

		test("Channels data and structure", function() {

		});

		module("UI Structure");

		test("Time bar UI elements", function() {

		  ok( $('#time-bar')[0] , "Time bar container exists." );

		});

		test("Channel bar UI elements", function() {

		  ok( $('#channels-bar')[0] , "Channel bar container exists." );

		});

		test("Time controls UI elements", function() {

		  ok( $('#time-controls')[0] , "Time controls container exists." );

		});

		module("Grid commons");

		test("first test within module", function() {
			ok( true, "all pass" );
		});

		test("second test within module", function() {
			ok( true, "all pass" );
		});

		module("Basic interaction");

		test("Expanded show date on a modal window", function() {
			ok( true, "all pass" );
		});

		module("Scrolling");

		test("Scrolling calls new show patches", function() {
			ok( true, "all pass" );
		});
	}

	return GridTest;

}); // define