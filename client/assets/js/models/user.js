/* UserModel */
define([

	'config/user'

], function(u) {

/* private */


/* @class GridModel */
var UserModel = {};

	/* constructor */
	UserModel.initialize = function() {

	};

	/* global setter */
	UserModel.set = function(key, value) {

		this[key] = value;

		upc.emit(u.MODEL_CHANGED, this[key]);

	};

	return UserModel;

});