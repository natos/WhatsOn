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

	elements = {
		a: doc.createElement('a'),
		i: doc.createElement('i'),
		b: doc.createElement('b'),
		p: doc.createElement('p'),
		h1: doc.createElement('h1'),
		ol: doc.createElement('ol'),
		ul: doc.createElement('ul'),
		li: doc.createElement('li'),
		div: doc.createElement('div'),
		img: doc.createElement('img'),
		span: doc.createElement('span'),
		time: doc.createElement('time'),
		form: doc.createElement('form'),
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
	},

/* public */

	main = doc.getElementById('main'),

	content = doc.getElementById('content');


	// Creates a DOM element with
	// attributes
	function element(e, attrs) {

		element = elements[e].cloneNode(false);

		for (var attr in attrs) {
			element.setAttribute(attr, attrs[attr])
		}

		return element;
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
		while (el.hasChildNodes()) {
		    el.removeChild(el.firstChild);
		}
	}

/* export */

	return {
		name		: name,
		main	 	: main,
		content 	: content,
		create		: create,
		element 	: element,
		getDataset	: getDataset,
		empty		: empty
	};

});