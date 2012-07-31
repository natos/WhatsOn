/*
* SearchView
* --------------
*
* Controlls search page
*
*/

define([

	'config/app',
	'modules/app',
	'lib/flaco/view',
	'modules/router'

], function(a, App, View, Router) {

	var name = 'search';

/* private */

	function filterHandler(event) {

		event.stopPropagation();

		var el = event.target,
			checked = $(el).attr('checked'),
			klass = $(el).parents('li').attr('class'),
			value = el.value;

		if (!klass||!value) { return; }

		filters[klass][value] = checked;

		applyFilters();

	}

	function isEmpty(klass) {
		var empty_filters = true;
		for (var filter in filters[klass]) {
			if (filters[klass][filter]) {
				empty_filters = false;
			}
		}
		return empty_filters;
	}

	function applyFilters() {

		var $results = $('#search-results'),
			_emptyChannels = isEmpty('channel'),
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
	}

	function initResults() {

		// scan the possible filters
		var $filters = $('#filters');
		$filters.find('input').each(function(index, item) {

			var klass = $(item).parents('li').attr('class'),
				value = item.value;

			if (!filters[klass]){
				filters[klass] = {};
			}
			
			filters[klass][value] = false;

		});

	}

	function submitHandler(event) {
		$('#content').load('/search?q=' + $('#q').val(), function(data, status, xhr){});
		return false;
	}

/* public */

	var filters = {};

	function initialize() {

		a._win.addEventListener('click', filterHandler, false);
		a._win.addEventListener('change', filterHandler, false);
		a._win.addEventListener('submit', submitHandler);

		return this;

	}

	function render() {

		initResults();

		return this;

	}

	function finalize() {

		a._win.removeEventListener('click', filterHandler, false);
		a._win.removeEventListener('change', filterHandler, false);
		a._win.removeEventListener('submit', submitHandler, false);

		return this;

	}


/* export */

	return new View({
		name		: name,
		initialize	: initialize,
		finalize	: finalize,
		render		: render,
		filters		: filters
	});

});