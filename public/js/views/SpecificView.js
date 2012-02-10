// SpecificView.js

define([

	// Dependencies
	'views/ListView'

], function(ListView) {

	var SpecificView = function() {};
		SpecificView.prototype = ListView.prototype;

	return SpecificView;

//	return _.extend({}, ListView);

}); // define