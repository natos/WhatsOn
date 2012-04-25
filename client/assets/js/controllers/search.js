define([

], function() {

var $window = $(window);

var $filters = $('#filters');

var $results = $('#search-results');

var filterHandler = function(event) {

	event.stopPropagation();

	var el = event.target,
		checked = $(el).attr('checked'),
		klass = $(el).parents('li').attr('class'),
		value = el.value;

	if (!klass||!value) { return; }

	Search.filters[klass][value] = checked;

	applyFilters();

	console.log(Search.filters);
};

var isEmpty = function(klass) {
	var empty_filters = true;
	for (var filter in Search.filters[klass]) {
		if (Search.filters[klass][filter]) {
			empty_filters = false;
		}
	}
	return empty_filters;
};

var applyFilters = function() {

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
};

var Search = {};

	Search.filters = {};

	Search.initialize = function() {

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

		return this;

	};

	return Search;

});