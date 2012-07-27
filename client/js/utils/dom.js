/* 
* DOMUtils
* --------
*
*
*/

define([


], function DOMUtilsScope() {

	var name = 'domutils',

/* private */

	doc = document,

/* public */

	elements = {
		a: doc.createElement('a'),
		i: doc.createElement('i'),
		b: doc.createElement('b'),
		div: doc.createElement('div'),
		span: doc.createElement('span'),
		img: doc.createElement('img'),
		li: doc.createElement('li'),
		style: doc.createElement('style'),
		fragment: doc.createDocumentFragment()
	};

	function create(e) {
		return elements[e].cloneNode(false);
	}

/* export */

	return {
		name		: name,
		create		: create
	};

});