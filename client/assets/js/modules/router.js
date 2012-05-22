/* 
* RouterModule
* ------
* This module is responsible for handling client-side routing.
*
* The router observes the window.onhashchange event, and takes action whenever the
* location hash is updated
*
* The map object holds a hash of modules and associated handler functions.
* Items are added to the routing map object by calling the .add() method on the router.
*
* Using HTML5 pushState API
* TODO: degrade try History.js (http://balupton.github.com/history.js/demo/)
*/

define([

	'config/app'

], function RouterModule(a) {

/* private */

	var map = {};

	/* constructor */
	function initialize(routes) {

		if (routes) {
			map = routes;
		}

		window.addEventListener('popstate', evaluateLocation);

		return this;
	
	};

	/* destructor */
	function finalize() {

		window.removeEventListener('popstate', evaluateLocation);

		return this;

	};

	function getHash() {

		var match = window.location.href.match(/#(.*)$/);

		return match ? match[1] : '';

	};

	function evaluateLocation() {

		var hash = getHash(),
			parts = hash.match(/(\w+|\d+)/gi),
			module = (parts) ? parts[0] : '';

		if (map[module]) { 

			upc.emit(a.NAVIGATE, module, parts);

			map[module].apply(this, parts); 
		}

		return this;
	};

	function navigate(to) {

		history.pushState({ page: to}, to, to);

		return this;

	};

	function navigateSilent(to) {

		history.replaceState({ page: to}, to, to);

		return this;

	};

    /**
     * Add an item to the routing map.
     * Accepts a module name as a route, and a callback function.
     * When the route is activated, the parts of the path *after* the route are passed to the
     * callback function as parameters.
     *
     * Example:
     * router.add('grid', function(){console.log(arguments)});
     */
 	function add(route, handler) {

		map[route] = handler;

		return this;

	};

/* public */

	return {
		name: 'router',
		initialize: initialize,
		add: add,
		navigate: navigate,
		map: map
	};

});