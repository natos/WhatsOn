/* 
* RouterModule
* ------
* This module is responsible for handling client-side routing.
*
* For now, let's use the Hashchange event for client-side navigation URLs
* instead of the HTML5 History API. This gives us better compatibility back
* as far as IE8.
* Roadmap for the future: 
* 1) investigate History.js (http://balupton.github.com/history.js/demo/)
* 2) move to HTML5 History API
*
* The client-side application is loaded ON TOP OF the HTML4 page. The client app
* can be entered via any url in the HTML4 app. For example, the following URLs
* all lead to the user being shown the grid view:
* 
* - http://upcsocial.com/#grid
* - http://upcsocial.com/movies#grid
* - http://upcsocial.com/grid#grid
*
* Mustard detection takes place in the <head> of the page.
* If the client app is to be loaded, a "Loading" layer will hide the page's original
* content while the page is loading. 
* After the onload event, the client app starts up, and replaces the original page
* content with the correct view.
*
* Client-side navigation/routing sequence:
*
* 1) Client-side code calls Router.navigateTo(module, params)
* 2) Router updates the hash in the browser URL
* 3) Browser raises the hashchange event
* 4) Router observes the hashchange event 
* 5) Router raises the application-level NAVIGATE event, with a set of event parameters
* 6) Canvas object observes the NAVIGATE event, and activates the appropriate controller
*
* This sequence allows app to render a new view even when the user changes the URL manually. 
*
* (MS 23/5/2012: the separation of concerns between Router and Canvas doesn't feel right to me.)
*/

define([

	'config/app'

], function RouterModule(appConfig) {


	/**
	 * Set up event handlers.
	 * @public
	 */
	function initialize(routes) {

		$(window).on('hashchange', evaluateLocation);

		return this;
	
	};

	/**
	 * Clean up event handlers.
	 * @public
	 */
	function finalize() {

		$(window).off('hashchange', evaluateLocation);

		return this;

	};

	/**
	 * Normalize the URL hash. Not all browsers include the '#' symbol in the value of location.hash
	 * @private
	 */
	function getHash() {

		var match = window.location.href.match(/#(.*)$/);

		return match ? match[1] : '';

	};

	/**
	 * Turn a querystring into an object hash
	 */
	function getParams(str) {
		var params = {};

		if (typeof(str)==='string' && str.length>0) {

			// Remove the '?'
			if (str.slice(0,1)==='?') {
				str = str.slice(1);
			}

			var paramParts = str.split('&'),
				paramPartsLength = paramParts.length,
				i,
				paramPair;

			for (i=0; i<paramPartsLength; i++) {
				paramPair = paramParts[i].split('=');
				params[paramPair[0]] = paramPair.length===2 ? paramPair[1] : null;
			}

		}

		return params
	}

	/**
	 * Read and evaluate the current URL hash, and raise a NAVIGATE event
	 * @public
	 */
	function evaluateLocation() {

		var hash = getHash(),
			parts = hash.split('?'),
			moduleName = parts[0],
			paramString = parts.length===2 ? parts[1] : '',
			params = getParams(paramString);

		// If no module specified, use the base URL
		if (moduleName==='') {
			moduleName = window.location.pathname.split('/')[1] || '';
		}

		upc.emit(appConfig.NAVIGATE, moduleName, params);

		return this;
	};

	/**
	 * Request navigation to a module, with a set of parameters 
	 * @public
	 */
	function navigateTo(moduleName, params) {

		var hash = "#" + moduleName,
			paramName,
			paramPairs = [];

		if (params) {
			for (var paramName in params) {
				if (params.hasOwnProperty(paramName)) {
					paramPairs.push(paramName + '=' + params[paramName].toString());
				}
			}
		}

		if (paramPairs.length>0) {
			hash += '?' + paramPairs.join('&');
		}

		document.location.hash = hash

		return this;

	};


	/* public */
	return {
		name: 'router',
		initialize: initialize,
		finalize: finalize,
		navigate: navigateTo,
		evaluateLocation: evaluateLocation
	};

});