/*
* GenericView
* -----------
*/

define([

	'config/app',
	'modules/event',
	'utils/dom'

], function GenericViewScope(a, Event, dom) {

/* private */

	// consts
	var VIEW		= 'VIEW',
		NAME		= 'name',
		METHOD		= 'method',
		PRESENT		= 'present',
		PAST		= 'past',
		RENDER		= 'render',
		INITIALIZE	= 'initialize',
		FINALIZE	= 'finalize',
		SCRIPT_TAG	= '<script type="text/template">',

	// shorcuts
		slice = Array.prototype.slice;

/* public */

	// Once a view is initialized
	// start rendering
	Event.on(a.VIEW_INITIALIZED, function(view){ view.render(); });


	function ViewConstructor(o) {

	/* subclass View */

		var View = {},

	/* private */

			// iterator
			member,

			// common helpers		
			to = (function() {

				var expression = /^(\w+)(e|er)$/gi;

				function processPresent(t, p1, p2, a) { return (/er$/.test(t)) ? p1 + p2 + 'ing' : p1 + 'ing'; }
				function processPast(t, p1, p2, a) { return (/er$/.test(t)) ? p1 + p2 + 'ed' : p1 + 'ed'; }

				return {
					present: function toPresent(member) { return member.replace(expression, processPresent).toUpperCase(); },
					past: function toPast(member) { return member.replace(expression, processPast).toUpperCase(); }
				};

			})(),

	/* protected */

			components = o.components;

		// helper for each component
		function forEachComponent(method, args) {
			if (!components) { return; }
			var name, component;
			for (name in components) {
				if (components.hasOwnProperty(name)) {
					component = components[name];
					if (typeof(component[method])==='function') {
						component[method].apply(component, args);
					}
				}
			}
		}

		// define members
		function defineMember(member) {

			// override method
			var	method = o[member],
				// present and past event names
				present = a[VIEW + '_' + to.present(member)],
				past = a[VIEW + '_' + to.past(member)],
				// helpers for named functions
				inherit = {};
				inherit[INITIALIZE] = function initialize() { return inherited.apply(View, arguments); };
				inherit[RENDER] 	= function render() 	{ return inherited.apply(View, arguments); };
				inherit[FINALIZE] 	= function finalize() 	{ return inherited.apply(View, arguments); };

/* console.log(VIEW, member, present, past, to.present(member), to.past(member), a); */

			// helper to find reserved words
			function isInherited(member) { return inherit[member]; }

			// wapper for inherited methods
			// automatically triggers events, call view methods…
			function inherited() {
				// grab the arguments
				var args = slice.call(arguments, 0);
				// save the current State for future reference
				if (member === INITIALIZE) { View.State = args[0]; }
				// emit 'first' event
				if (present) { Event.emit(present, View, args); }
				// invert execution order when FINALIZE
				if (member === FINALIZE) {
					// call the same method for all components views
					// using 'call' here because uses an argument list
					// instead of an array of arguments
					forEachComponent.call(View, member, args);
					// apply the method
					if (method) { method.apply(View, args); }
					// self empty view container
					dom.empty(dom.content);
				} else {
					// for INITIALIZE and RENDER use default execution order
					// apply the method
					if (method) { method.apply(View, args); }
					// call the same method for all components views
					// using 'call' here because uses an argument list
					// instead of an array of arguments
					forEachComponent.call(View, member, args);
				}
				// emit 'last' event
				if (past) { Event.emit(past, View, args); }
				// return the View object
				return this;
			}

			/* inherited * or * public member */
			View[member] = isInherited(member) ? inherit[member] : o[member];
		}

	/* public */

	/* export subclass */

		// define all members
		for (member in o) { defineMember(member); }

		// export class
		return View;

	}

/* export */

/* 
 *	Use: new ViewContructor({ ..lots of properties and stuff.. });
 */

	return ViewConstructor;

});