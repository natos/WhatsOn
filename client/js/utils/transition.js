/* 
* TransitionUtils
* ---------------
*/

define([

	'config/app',
	'modules/event',
	'utils/dom'

], function(a, Event, dom) {

	'use strict';

	// constants
	var transitionElement, loadingElement;

	/*
	*	Transition
	*/
	function start() {

		transitionElement = document.getElementById('transition');
		if (!transitionElement) {
			transitionElement = dom.element('div', { id: 'transition' });
			loadingElement = dom.element('div', { class: 'loading' });
			transitionElement.appendChild(loadingElement);
			dom.content.appendChild(transitionElement);
		}
		transitionElement.className = 'background';
	}

	function end() {
		transitionElement = document.getElementById('transition');
		if (transitionElement) {
			transitionElement.className = 'background hide';
			setTimeout(function removeTransition() {
				if (transitionElement && transitionElement.parentNode) {
					transitionElement.parentNode.removeChild(transitionElement);
				}
			}, 500);
		}
	}

	return {
		start 	: start,
		end 	: end,
	};

});