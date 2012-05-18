/* 
* NavigationView
* --------------
*
* Controlls navigation
*
*/

define([

	'config/app',
	'modules/app'

], function NavigationView(c, App) {

/* private */

	/* constructor */
	function initialize() {

		/** 
		*	Events handlers
		*/

		//App.emit(c.VIEW_LOADED, this);

		return this;

	};


/* @class NavigationView */
	return {
		initialize: initialize
	}

});