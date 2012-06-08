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

	var slice = Array.prototype.slice;

/* public */

	function ControllerConstructor(o) {

	/* subclass View */

		var Controller = {};

	/* protected */

		var view = o.view;

		// helper to find reserved words
		function isInherited(member) { return ['initialize', 'finalize'].indexOf(member) >= 0; };

		// define public members
		function definePublicMember(member) { if (!isInherited(member)) { Controller[member] = o[member]; } };

		// define inherited members
		function defineInheritedMember(member) {

			var name = member['name'],
				method = o[name],
				first_event = member['first_event'],
				last_event = member['last_event'];

			// define a method inside subclass
			Controller[method['name']] = function() {
				// grab the arguments
		        var args = slice.call(arguments, 0);
				// emit 'first' event
				first_event && App.emit(first_event, Controller, args);
				// apply the method
				method && method.apply(Controller, args);
				// run View method
				view[method['name']] && view[method['name']].apply(Controller, args);
				// emit 'last' event
				last_event && App.emit(last_event, Controller, args);
				// return the Controller object
				return Controller;
			}
		};

	/* public */

		// Controller inherited methods
		[{
			"name": "initialize",
			"first_event": a.CONTROLLER_INITIALIZING,
			"last_event": a.CONTROLLER_INITIALIZED
		}, {
			"name": "finalize",
			"first_event": a.CONTROLLER_FINALIZING,
			"last_event": a.CONTROLLER_FINALIZED
		}]
		.map(defineInheritedMember);

		// process members, mark as public
		for (member in o) { definePublicMember(member);	};

	/* export subclass */

		return Controller;

	}

/* 
 *	Return constructor
 *	Use: new ControllerConstructor({ ..lots of properties and stuff.. });
 */

	return ControllerConstructor;

});