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

	/**
	* Not all browser support the .dataset property
	* for DOM elements. This function performs the same
	* function: it gathers all the data-* attributes of a
	* DOM element, and returns them as a hash.
	* Example: <p id="testP" data-monkey="fez" data-turtle="mine"></p>
	* getDataset(p); // {'monkey':'fez', 'turtle':'mine'}
	*/
	function getDataset(el) {
		var dataset = {};
		var attributes, attribute, attributeName, i;

		if (el && el.nodeType==1 /* DOMElement */) {
			attributes = el.attributes;
			if (attributes && attributes.length) {
				i = attributes.length;
				while (i--) {
					attribute = attributes.item(i);
					attributeName = attribute.nodeName;
					if (attributeName.slice(0,5) === 'data-') {
						dataset[attributeName.slice(5)] = attribute.value;
					}
				}
			}
		}
		return dataset;
	}

/* export */

	return {
		name		: name,
		create		: create,
		getDataset	: getDataset
	};

});