// ExampleTest.js

define([
	'tests/Test'
],

function(Test) {


	var ExampleTest = function() {

		// Borrow the skeleton constructor
		Test.call(this);

	};

	ExampleTest.prototype.run = function() {

		module("Example Test");

		test("Simple Example", function(){

			ok( true , "Passing test" );

			ok( false , "Failing test" );

		});

	}

	return ExampleTest;

}); // define