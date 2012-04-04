/**
*	RequestN
*	Multiple requires 
*/

define([

/**
*	@requires
*/
	'request'
],


/**
*	@class RequestN
*/

function(request) {

	/** @constructor */

	var RequestN = function(urls, callback) {

		'use strict';

		var results = {}, t = urls.length, c = 0,
			handler = function (error, response, body) {

				var url = response && response.request.uri.href;

				results[url] = { error: error, response: response, body: body };

				if (++c === urls.length) { callback(results); }

			};

		while (t--) { request(urls[t], handler); }

	};

	/** @private */

	/** @public */

	/** @return */

	return RequestN;

});