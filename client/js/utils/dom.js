/* 
* DOMUtils
* --------
*/

define([


], function DOMUtilsScope() {

	var name = 'domutils',

/* private */

	// dom access

	doc = document,

	main = doc.getElementById('main'),

	content = doc.getElementById('content'),

	// references

	element,

	elements = {
		a: doc.createElement('a'),
		i: doc.createElement('i'),
		b: doc.createElement('b'),
		p: doc.createElement('p'),
		h1: doc.createElement('h1'),
		h2: doc.createElement('h2'),
		h3: doc.createElement('h3'),
		h4: doc.createElement('h4'),
		h5: doc.createElement('h5'),
		h6: doc.createElement('h6'),
		ol: doc.createElement('ol'),
		ul: doc.createElement('ul'),
		li: doc.createElement('li'),
		div: doc.createElement('div'),
		img: doc.createElement('img'),
		span: doc.createElement('span'),
		time: doc.createElement('time'),
		form: doc.createElement('form'),
		label: doc.createElement('label'),
		style: doc.createElement('style'),
		aside: doc.createElement('aside'),
		input: doc.createElement('input'),
		button: doc.createElement('button'),
		select: doc.createElement('select'),
		option: doc.createElement('option'),
		header: doc.createElement('header'),
		section: doc.createElement('section'),
		article: doc.createElement('article'),
		fragment: doc.createDocumentFragment()
	};

/* public */

	// Creates a DOM element with
	// attributes
	function element(e, attrs) {

		element = elements[e].cloneNode(false);

		for (var attr in attrs) {
			element.setAttribute(attr, attrs[attr])
		}

		return element;
	}

	// Creates a DOM text node
	function text(str) {
		return doc.createTextNode(str);
	}

	// deprecated
	function create(e) {
		return elements[e].cloneNode(false);
	}

	/**
	* Not all browsers support the .dataset property
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

	/**
	* Clear an element's contents. Like jQuery.empty().
	*/
	function empty(el) {
		if (!el) { return; }
		while (el.hasChildNodes()) {
		    el.removeChild(el.firstChild);
		}
	}

/* export */

	return {
		name		: name,
		doc 		: doc,
		main	 	: main,
		content 	: content,
		create		: create,
		element 	: element,
		text		: text,
		getDataset	: getDataset,
		empty		: empty
	};

});