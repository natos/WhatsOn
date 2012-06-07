/* 
* GenericView
* -----------
*
*/

define([

	'config/app',
	'modules/app'

], function GenericViewScope(a, App) {

/* private */

	var slice = Array.prototype.slice;

	/**
	*	Generic inner template functions
	*/

	// returns template name
	function templateName(view) { return '#' + view.name + '-template'; };

	// returns if the template DOM element exists
	function templateExists(view) { return $( templateName(view) )[0]; };

	// renders the template
	function setTemplate(view) {
		a.$content.html( $( templateName(view) ).text() );
		view.render();
	};

	// fetch template from server
	function fetchTemplate(view) {
		// create template container and append it to the DOM
		var $template = $('<script type="text/template">').attr('id', templateName(view).replace('#','')).appendTo('#templates'),
		// fetch from url
		from_url = '/' + view.name + (view.State && view.State.parts ? '/' + view.State.parts.join('/') : '' );
		// fetch content from server
		$.get(from_url, function(res) {
			// save it in the DOM container
			$template.text(res);
			// set the template view
			setTemplate(view);
		});
	};

	/* Main template functions */

	// loads template, if not exists, it will fetch the template from server
	function loadTemplate(view) {
		if ( !$('#' + view.name + '-content')[0] ) {
			templateExists(view) ? setTemplate(view) : fetchTemplate(view);
		}
		view.render();
	};

	// well, nothing for now
	function unloadTemplate(view) {
		// ? not sure what to do here...
	};

	/**
	*	Generic inner template handling
	*/
	// load template data,
	// when any view finish initialization
	App.on(a.VIEW_INITIALIZED, loadTemplate);
	// unload template,
	// when any view is being finalized
	App.on(a.VIEW_FINALIZING, unloadTemplate);

/* public */

	function ViewConstructor(o) {

	/* subclass View */

		var View = {}

	/* protected */

		var components = o.components;

		// helper for each component
		function forEachComponent(method, arguments) {
			if (!components) { return; }
			var name, component;
			for (name in components) {
				if (components.hasOwnProperty(name)) {
					component = components[name];
					if (typeof(component[method])==='function') {
						component[method].apply(arguments);
					}
				}
			}
		};

		// helper to find reserved words
		function isInherited(member) { return ['render', 'initialize', 'finalize'].indexOf(member) >= 0; };

		// define public members
		function definePublicMember(member) { if (!isInherited(member)) { View[member] = o[member]; } };

		// define inherited members
		function defineInheritedMember(member) {

			var name = member['name'],
				method = o[name],
				first_event = member['first_event'],
				last_event = member['last_event'];

			// define a method inside subclass
			View[name] = function inherited() {
				// grab the arguments
		        var args = slice.call(arguments, 0)[0];
				// switch for specifics
				switch (name) {
				case 'initialize':
					// save the current State for future reference
					View.State = args;
				case 'render':
				case 'finalize':
					// emit 'first' event
					first_event && App.emit(first_event, View, args);
					// apply the method
					method && method.apply(View, [args] || []);
					// call the same method for all components views
					// using 'call' here because uses an argument list
					// instead of an array of arguments
					forEachComponent.call(View, name, args);
					// emit 'last' event
					last_event && App.emit(last_event, View, args);					
				}

				// return the subclass
				return View;
			}
		};

	/* public */

		// View inherited methods
		[{
			"name": "initialize",
			"first_event": a.VIEW_INITIALIZING,
			"last_event": a.VIEW_INITIALIZED
		}, {
			"name": "render",
			"first_event": a.VIEW_RENDERING,
			"last_event": a.VIEW_RENDERED
		}, {
			"name": "finalize",
			"first_event": a.VIEW_FINALIZING,
			"last_event": a.VIEW_FINALIZED
		}]
		.map(defineInheritedMember);

		// process members, mark as public
		for (member in o) { definePublicMember(member);	};

	/* export subclass */

		return View;

	}

/* 
 *	Return constructor
 *	Use: new ViewContructor({ ..lots of properties and stuff.. });
 */

	return ViewConstructor;

});