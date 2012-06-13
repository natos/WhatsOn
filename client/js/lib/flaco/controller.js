/* 
* GenericController
* -----------------
*
*/

define([

	'config/app',
	'modules/app'

], function GenericControllerScope(a, App) {

/* private */

	// consts

	var CONTROLLER	= 'CONTROLLER',
		NAME 		= 'name',
		METHOD		= 'method',
		PRESENT 	= 'present',
		PAST	 	= 'past',
		INITIALIZE 	= 'initialize',
		FINALIZE 	= 'finalize',

	// shorcuts

	slice = Array.prototype.slice;

/* public */

	function ControllerConstructor(o) {

	/* subclass View */

		var Controller = {},

	/* private */

			// common helpers		
			to = {
				present: function toPresent(member) { return member.replace(/^(\w+)(?:e)$/gi, '$1ing').toUpperCase(); },
				past: function toPast(member) { return member.replace(/^(\w+)(?:e)$/gi, '$1ed').toUpperCase(); }
			},

	/* protected */

			view = o.view;

		// define members
		function defineMember(member) {

			// override method
			var	method = o[member],
				viewMethod = view[member],
				// present and past event names
				present = a[CONTROLLER + '_' + to.present(member)],
				past = a[CONTROLLER + '_' + to.past(member)],
				// helpers for named functions
				inherit = {};
				inherit[INITIALIZE] = function initialize() { return inherited.apply(Controller, arguments); };
				inherit[FINALIZE] = function finalize() { return inherited.apply(Controller, arguments); };

			// helper to find reserved words
			function isInherited(member) { return inherit[member]; };

			// wapper for inherited methods
			// automatically triggers events, call view methods…
			function inherited() {
				// grab the arguments
			    var args = slice.call(arguments, 0);
				// emit 'first' event
				present && App.emit(present, Controller, args);
				// apply the method
				method && method.apply(Controller, args);
				// run View method
				viewMethod && viewMethod.apply(Controller, args);
				// emit 'last' event
				past && App.emit(past, Controller, args);
				// return the Controller object
				return this;
			}

			/* inherited * or * public member */
			Controller[member] = isInherited(member) ? inherit[member] : o[member];
		};

	/* public */

	/* export subclass */

		// define all members
		for (member in o) { defineMember(member); };

		// export class
		return Controller;

	}

/* export */

/*
 * Use: new ControllerConstructor({ ..lots of properties and stuff.. }); 
 */

	return ControllerConstructor;

});