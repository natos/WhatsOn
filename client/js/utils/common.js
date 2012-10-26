/*
* Common Util
* -----------
*/

define([

], function Common() {

/* private */

/* public */

	// Checks if the argument is an Object
	// @return Boolean
	function isObject(x) { return Object.prototype.toString.call(x) === '[object Object]'; }

	// Checks if the argument is an Array
	// @return Boolean
	function isArray(x) { return Object.prototype.toString.call(x) === '[object Array]'; }

	// Checks if the argument is an empty Object
	// @return Boolean
	function isEmpty(x) { for (var key in x) { if (x.hasOwnProperty(key)) { return false; } } return true; }

	// Compares two objects for equality
	// @return Boolean
	function isEqual(x, y) {
		var p;
		for (p in x) { if(typeof(y[p])=='undefined') { return false; } }
		for (p in x) {
			if (x[p]) {
				switch(typeof(x[p])) {
					case 'object':
						if (!isEqual(x[p],y[p])) { return false; } 
						break;
					case 'function':
						if (typeof(y[p])=='undefined' || (p != 'equals' && x[p].toString() != y[p].toString())) { return false; }
						break;
					default:
						if (x[p] != y[p]) { return false; }
				}
			} else {
				if (y[p]) { return false; }
			}
		}
		for (p in y) { if(typeof(x[p])=='undefined') { return false; } }
		return true;
	}

	// Get the difference between two Arrays or Objects
	// @return Array || Object
	function difference(x, y) {

		var i, t, lbl, xc = {}, yc = {}, diff = false;

		if (isArray(x) && isArray(y)) {

			diff = [];

			for (i = 0, t = x.length; i < t; i++) { xc[JSON.stringify(x[i])] = true; }
			for (i = 0, t = y.length; i < t; i++) { yc[JSON.stringify(y[i])] = true; }

			for (lbl in xc) { if (!(lbl in yc)) { diff.push(JSON.parse(lbl)); } }
			for (lbl in yc) { if (!(lbl in xc)) { diff.push(JSON.parse(lbl)); } }

		}

		if (isObject(x) && isObject(y)) {

			diff = {};

			for (lbl in x) { if (!(lbl in y)) { diff[lbl] = x[lbl]; } }
			for (lbl in y) { if (!(lbl in x)) { diff[lbl] = y[lbl]; } }

		}

		return diff;

	}

	// Merge two arrays or two objects into one of the same type.
	// @return Array || Object
	function merge(x, y) {

		var i, t, lbl, xc = {}, yc = {}, merge = false;

		if (isArray(x) && isArray(y)) {
			
			merge = [];
			
			for (i = 0, t = x.length; i < t; i++) { merge.push(x[i]); }
			for (i = 0, t = y.length; i < t; i++) { merge.push(y[i]); }

		}

		if (isObject(x) && isObject(y)) {
			
			merge = {};

			for (lbl in x) { merge[lbl] = x[lbl]; }
			for (lbl in y) { merge[lbl] = y[lbl]; }
		}

		return merge;
	}


	// empty and object to reuse
	function empty(x) {
		for (e in x) { x[e] = null; }
	}

/* export */

	return {
		isArray		: isArray,
		isObject 	: isObject,
		isEmpty		: isEmpty,
		isEqual 	: isEqual,
		difference 	: difference,
		merge 		: merge,
		empty 		: empty
	};

});