/* 
* DashboardView
* -------------
*
*/

define([

	'config/app',
	'modules/app',
	'components/carousel'

], function DashboardView(a, App, Carousel) {

/* private */

	var $template = $( $('#templates script[data-template="dashboard-layout"]').text() );

	function initialize() {

		render()	

		// configure and run components
		this.components = {
			// dom query to select the carousel
			carousel: Carousel.initialize('#featured')
		};

		App.emit(a.VIEW_LOADED, this);
	
		return this;
	
	};

	function finalize() {

	};

	function render() {

		a.$content.html($template);

		App.emit(a.VIEW_RENDERED, this);

	};

/* public */

/* @class Dashboard */
	return {
		/* constructor */
		initialize: initialize
	};

});