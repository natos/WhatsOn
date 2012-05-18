/* 
* SearchView
* --------------
*
* Controlls search page
*
*/

define([

	'config/app',
	'modules/app'

], function(c, App) {

/* private */

	//TODO: Move this variables to a config file
	var $window = $(window),

	$filters = $('#filters'),

	$results = $('#search-results');

	var filters = {};

	/* constructor */
	function initialize() {

		// Let the App know your here
		App.views.search = this;

		// scan all the possible filters
		$filters.find('input').each(function(index, item) {

			var klass = $(item).parents('li').attr('class'),
				value = item.value;

			if (!filters[klass]){
				filters[klass] = {};
			}
			
			filters[klass][value] = false;

		});

		// filtrable
		$filters.on('click', filterHandler);


		// layout quirks
		// min-heigth for results
		$results.css('min-height', $filters.height());
		// static positioning on the search box
		$('.search-box').css({'top': '50px'});
		$('.main').css({'margin-top': '95px'});
		// Assign the query to the search box
		$('#q').val(query);

		App.emit(c.VIEW_LOADED, this);

		return this;

	};


	function filterHandler(event) {

		event.stopPropagation();

		var el = event.target,
			checked = $(el).attr('checked'),
			klass = $(el).parents('li').attr('class'),
			value = el.value;

		if (!klass||!value) { return; }

		filters[klass][value] = checked;

		applyFilters();

	};

	function isEmpty(klass) {
		var empty_filters = true;
		for (var filter in filters[klass]) {
			if (filters[klass][filter]) {
				empty_filters = false;
			}
		}
		return empty_filters;
	};

	function applyFilters() {

		var _emptyChannels = isEmpty('channel'),
			_emptyDatetimes = isEmpty('datetime');
	
		if (_emptyChannels && _emptyDatetimes) {
			$results.find("li").show();
			return;
		}
	
		$results.find("li").hide();
		$results.find("li").each(function(index, item){
			var $item = $(item);
				$programme = $item.parents('.programme');
	
			if (_emptyChannels) {
				if (filters.datetime[$item.data('datetime')]) {
					$programme.show();
					$item.show();
				}
			} else if (_emptyDatetimes) {
				if (filters.channel[$item.data('channel')]) {
					$programme.show();
					$item.show();
				}
			} else {
				if (filters.channel[$item.data('channel')] && filters.datetime[$item.data('datetime')]) {
					$programme.show();
					$item.show();
				}
			}
		});
	};


/* public */

/* @class Search */
	return {
		initialize: initialize,
		filters: filters
	};

});