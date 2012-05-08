define([

	'config/app',
	'controllers/app'

], function(c, App) {

/* private */

var $window = $(window),

	$filters = $('#filters'),

	$results = $('#search-results'),

	filterHandler = function(event) {

		event.stopPropagation();

		var el = event.target,
			checked = $(el).attr('checked'),
			klass = $(el).parents('li').attr('class'),
			value = el.value;

		if (!klass||!value) { return; }

		Search.filters[klass][value] = checked;

		applyFilters();

	},

	isEmpty = function(klass) {
		var empty_filters = true;
		for (var filter in Search.filters[klass]) {
			if (Search.filters[klass][filter]) {
				empty_filters = false;
			}
		}
		return empty_filters;
	},

	applyFilters = function() {

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
				if (Search.filters.datetime[$item.data('datetime')]) {
					$programme.show();
					$item.show();
				}
			} else if (_emptyDatetimes) {
				if (Search.filters.channel[$item.data('channel')]) {
					$programme.show();
					$item.show();
				}
			} else {
				if (Search.filters.channel[$item.data('channel')] && Search.filters.datetime[$item.data('datetime')]) {
					$programme.show();
					$item.show();
				}
			}
		});
	},

	/* @class Search */
	Search = {};

	Search.filters = {};

	/* constructor */
	Search.initialize = function() {

		// Let the App know your here
		//App.views.search = this;

		// scan all the possible filters
		$filters.find('input').each(function(index, item) {

			var klass = $(item).parents('li').attr('class'),
				value = item.value;

			if (!Search.filters[klass]){
				Search.filters[klass] = {};
			}
			
			Search.filters[klass][value] = false;

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

		upc.emit(c.VIEW_LOADED, this);

		return this;

	};

	return Search;

});