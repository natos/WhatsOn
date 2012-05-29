/* 
* DashboardView
* -------------
*
*/

define([

	'config/app',
	'config/user',
	'modules/app',
	'models/user',
	'components/carousel'

], function DashboardView(a, u, App, UserModel, Carousel) {

	/**
	 * Load the content for the view. 
	 * Activate associated components. 
	 * Set up event handlers.
	 * @public
	 */
	function initialize() {

		if ($('#content').find('#content-dashboard').length>0) {
			// Dashboard content is already loaded
			initializeComponents();
		} else {
			// Get dashboard content from server
			$('#content').load('/dashboard #content', function(data, status, xhr){
				initializeComponents();
			});
		}

		App.emit(a.VIEW_LOADED, 'dashboard');

		return this;
	
	};

	function renderFavorites() {

		if (UserModel.favorites) {
			render();
		}

		App.on(u.MODEL_CHANGED, function(changes) {

			if (changes.favorites) {
				render();
			}
	
		});

		function render() {

			var favorites = UserModel.favorites,
				list = $('.top-favorites ul').empty(),
				item = $('<li><i class="icon-chevron-right"></li>'),
				link = $('<a class="programme">');

			$(favorites.data).each(function(i, e) {
				var id = e.data.tv_show.url.match(/\d+/);

				link
					.clone()
					.attr('href', '/programme/' + id)
					.data('programmeid', id)
					.html(e.data.tv_show.title)
					.appendTo(
						item.clone().appendTo(list)
					);				
			});

		}

	};

	/**
	 * Activate sub-components of the view
	 * @private
	 */
	function initializeComponents() {
		this.components = {
			carousel: Carousel.initialize('#featured')
		};
		renderFavorites();

	};

	/**
	 * If necessary, remove the content for the view from the DOM.
	 * Deactivate associated components. 
	 * Clean up event handlers.
	 * @public
	 */
	function finalize() {
		finalizeComponents();
	};

	/**
	 * Deactivate associated components. 
	 * @private
	 */
	function finalizeComponents() {
		var carousel = this.components.carousel;
		if (carousel && typeof(carousel.finalize)==='function') {
			carousel.finalize();
		}
	};


	/* @class DashboardView */
	return {
		initialize: initialize,
		finalize: finalize
	};

});