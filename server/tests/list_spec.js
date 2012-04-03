var requirejs = require('requirejs');

/**
 * require configuration.
 */

requirejs.config({
    baseUrl: 'server',
    nodeRequire: require
});

requirejs([

	'utils/list'

],

function(List) {

	/** Raw Data */
	var data = [
		{ name: "Jimi", last: "Hendrix" }
	,	{ name: "Janis", last: "Joplin" }
	,	{ name: "Jim", last: "Morrison" }
	];


	var list = new List();

	describe("List methods, adding, removing, getting and sizing", function() {

		it('should add a collection of data and return it', function() {

			expect( list.add(data) ).toEqual( data );

		});

		it('should get all the children without argument', function() {

			expect( list.get() ).toEqual( data );

		});

		it('should return the size equals of the amount of data', function() {

			expect( list.size() ).toEqual( data.length );

		});

		it('should remove the first guy, return it and change list size', function() {

			expect( list.remove('Jimi') ).toEqual( data[0] );

			expect( list.size() ).toEqual( data.length - 1 );

		});

		it('should get the last guy by first name (case sensitive) and return it', function() {

			expect( list.get('Jim') ).toEqual( data[data.length-1] );

		});

		it('should get the last guy by last name (case sensitive) and return it', function() {

			expect( list.get('Morrison') ).toEqual( data[data.length-1] );

		});

		it('should get the last guy by numeric index and return it', function() {

			expect( list.get(2) ).toEqual( data[data.length-1] );

		});

		it('should add a single object, and return the content of the list', function() {

			expect( list.add({ name: "Eric", last: "Clapton"}) ).toEqual( { name: "Eric", last: "Clapton"} );

		});
	});

});