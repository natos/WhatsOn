/*
* GenericView
* -----------
*/

define([

	'config/app',
	'modules/app'

], function GenericViewScope(a, App) {

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

	/**
	*	Generic inner templatign
	*/

	// returns template name for a given view
	function templateName(view) {
		var parts = getParts(view).replace(/\//g,'-');
			parts = parts === "-" ? '' : parts;
		return view.name + parts + '-template';
	}

	function templateId(view) {	return '#' + templateName(view); }

	function getParts(view) { return (view.State && view.State.parts ? '/' + view.State.parts.join('/') : '' );	}

	// returns if the template DOM element exists
	function templateExists(view) { return $( templateId(view) )[0]; }

	// returns if the content DOM element exists
	function contentExists(view) { return $('#' + view.name + '-content')[0]; }

	// fetch template from server and save it to the DOM
	function fetchTemplate(view) {
		// fetch from url
		var from_url = '/' + view.name + getParts(view);
		// fetch content from server
		$.get(from_url, function saveNewTemplate(content) {
			saveTemplate(view, content);
			// set the template view
			setTemplate(view);
		});
	}

	// renders the template
	function setTemplate(view) {
		// write the template in the DOM
		a._content.innerHTML = $( templateId(view) ).text();
		// re write metadata content for this view
		var metamap = {}, original, metadata, property, content;
		// map original meta tags
		var original = $('head').find('meta');
			original.forEach(function(o) {
				property = $(o).attr('property');
				content = $(o).attr('content');
				if (property && content) { 
					metamap[property] = { 
						property: property, 
						content: content, 
						element: o }; 
				}
			});
		// compare and replace with new ones
		var $metadata = $('#content').find('meta');
			$metadata.forEach(function(meta) {
				property = $(meta).attr('property');
				content = $(meta).attr('content');
				if (metamap[property] && metamap[property].content !== content) {
					metamap[property].element['content'] = content;
				}
			});

		// render view :)
		view.render();
	}

	function saveTemplate(view, content) {
		var content = content || $('#content').html();
		// create template container and append it to the DOM
		var $template = templateExists(view) ? $( templateId(view) ) : $(SCRIPT_TAG).attr('id', templateName(view)).appendTo('#templates');
			// save it in the DOM container
			$template.text( content );
	}

	/* Main template functions */

	// loads template, if not exists, it will fetch the template from server
	function loadTemplate(view) {

		// avoid load templates for
		// content already rendered
		if (contentExists(view)) {
			view.render();
			return;
		}

		// if the template existe, use it
		if (templateExists(view)) {	
			setTemplate(view); 
		} else {
			console.log('template doesn\'t exist, fetch template');
			// otherwise, fetch it 
			fetchTemplate(view); 
		}
	}

	// well, nothing for now
	function unloadTemplate(view) {
		// ? not sure what to do here...
		// ? because the loadTemplate function
		// ? already steps on previews templates
		saveTemplate(view);
	}

	/**
	*	Generic inner template handling
	*/
	// load template data,
	// when any view finish initialization
	App.on(a.VIEW_INITIALIZED, loadTemplate);
	// unload template,
	// when any view finalized
	App.on(a.VIEW_FINALIZED, unloadTemplate);

/* public */

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
				if (present) { App.emit(present, View, args); }
				// apply the method
				if (method) { method.apply(View, args); }
				// call the same method for all components views
				// using 'call' here because uses an argument list
				// instead of an array of arguments
				forEachComponent.call(View, member, args);
				// emit 'last' event
				if(past) { App.emit(past, View, args); }
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