describe("module loading using require", function() {

	it('should run ok because is hardcoded', function() {

		expect(true).toEqual(true);

		expect(true).toNotEqual(false);

	});

	it('should run ok again because is also hardcoded, yup', function() {

		expect(true).toEqual(true);

		expect(true).toNotEqual(false);

	});

	it('should fail for real', function() {

		expect(true).toEqual(true);

		expect(true).toNotEqual(false);

	});

});