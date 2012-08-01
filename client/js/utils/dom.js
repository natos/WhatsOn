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
		li: doc.createElement('li'),
		div: doc.createElement('div'),
		img: doc.createElement('img'),
		span: doc.createElement('span'),
		style: doc.createElement('style'),
		button: doc.createElement('button'),
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