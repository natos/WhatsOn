/* 
* RouterModule 
* ------
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