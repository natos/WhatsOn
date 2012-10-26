/*
* SearchView
* --------------
*
* Controlls search page
*
*/

define([

	'modules/zepto',
	'config/app',
	'config/search',
	'modules/event',
	'modules/app',
	'lib/flaco/view',
	'controllers/search',
	'models/channel',
	'utils/dom',
	'utils/convert',
	'utils/language'

], function($, a, searchConfig, Event, app, View, searchController, channelModel, dom, convert, Language) {

	var name = 'search';
	var now = new Date();
	var lang = new Language();

/* private */

	function renderPageStructure() {

		var searchContent = document.getElementById('search-content');

		if (!searchContent) {
			searchContent = dom.element('div', {'id': 'search-content'});
			var header = dom.element('header', {'id': 'search-query'});
			var results = dom.element('section', {'id': 'search-results'});
			var form = dom.element('form', {'class': 'search-form'});
			var q = dom.element('input', {'type': 'search', 'id': 'q', 'name': 'q', 'placeholder': lang.translate('search-field-placeholder'), 'value': '', 'autofocus':'autofocus'});
			var submitButton = dom.element('button', {'type': 'submit', 'class': 'search-btn'});
			var icon = dom.element('i', {'class': 'icon-search'});
			var label = dom.element('b', {'class': 'label'});
			var buttonText = document.createTextNode(lang.translate('search'));

			label.appendChild(buttonText);
			submitButton.appendChild(icon);
			submitButton.appendChild(label);

			form.appendChild(q);
			form.appendChild(submitButton);

			header.appendChild(form);

			searchContent.appendChild(header);
			searchContent.appendChild(results);

			dom.content.appendChild(searchContent);
		} else {
			searchContent.style.display = '';
		}

	}

	function submitHandler(event) {
		event.preventDefault();
		var q = document.getElementById('q').value;
		Event.emit(searchConfig.SEARCH_FOR, q);
		return false;
	}

	function hidePageStructure() {
		var searchContent = document.getElementById('search-content');
		if (searchContent) {
			//searchContent.style.display = 'none';
			searchContent.parentNode.removeChild(searchContent);
		}
	}

	function onSearchModelChanged(changes) {
		var groupedResults;

		if (changes.searchResults) {
			if (changes.searchResults.length > 0) {
				var resultsGroups = groupResultsByProgrammeAndChannel(changes.searchResults);
				renderResultsGroups(resultsGroups);
			} else {
				renderNoResults();
			}
		}
	}

	function groupResultsByProgrammeAndChannel(originalResults) {
		var channelProgrammeCombinations = {};
		var key;
		var resultsGroups = [];
		var result, i;
		var originalResultsCount = originalResults.length;

		for (i=0; i<originalResultsCount; i++) {
			result = originalResults[i];
			key = result.channel.id + result.programme.title;
			if (!channelProgrammeCombinations[key]) {
				channelProgrammeCombinations[key] = [];
			}
			channelProgrammeCombinations[key].push(result);
		}

		for(key in channelProgrammeCombinations) {
			resultsGroups.push(channelProgrammeCombinations[key]);
		}

		return resultsGroups;
	}

	function renderResultsGroups(resultsGroups) {

		var groupsCount = resultsGroups.length;
		var i;

		var resultsContainer = document.getElementById('search-results');
		dom.empty(resultsContainer);

		for (i=0; i<groupsCount; i++) {
			renderResults(resultsContainer, resultsGroups[i]);
		}
	}

	function byStartDateTimeSorter(a,b) {
		var sortOrder = 0;
		if (a && b && a.startDateTime && b.startDateTime) {
			if (a.startDateTime < b.startDateTime) {
				sortOrder = -1;
			} else if (a.startDateTime > b.startDateTime) {
				sortOrder = 1;
			}
		}
		return sortOrder;
	}

	function renderResults(resultsContainer, results) {

		results = results.sort(byStartDateTimeSorter);

		var resultsCount = results.length;
		var i, result, li;
		var eventListContainer = dom.element('article', {'class':'event-list-container'});
		var ul = dom.element('ul', {'class' : 'event-list search-event-list'});

		var channel = channelModel.byId['s-' + results[0].channel.id];
		// Sometimes the channel doesn't exist? Probably because we're using
		// the old API for search, and the new API for channels.
		if (!channel) {
			return;
		}

		for (i=0; i<resultsCount; i++) {
			result = results[i];

			var nowTimeValue = new Date();
			var startDateTime = new Date(convert.parseApiDateStringAsMilliseconds(result.startDateTime));
			var endDateTime = new Date(convert.parseApiDateStringAsMilliseconds(result.endDateTime));
			// Note: only show events within the next 12 hours!
			// TODO: we need a better way of rendering the start day/daete + time in 
			// the search results list for displaying events that start further in the future. 
			if (startDateTime.valueOf() - now.valueOf() >= 43200000) {
				if (i===0) {
					return;
				} else {
					break;
				}
			}
			var hours = startDateTime.getHours();
			hours = (hours < 10)? '0' + hours : hours;
			var minutes = startDateTime.getMinutes();
			minutes = (minutes < 10)? '0' + minutes : minutes;
			var time = (hours + ':' + minutes);
			var startTimeValue = startDateTime.valueOf();
			var endTimeValue = endDateTime.valueOf();
			var percentageComplete = (100 * (nowTimeValue - startTimeValue)) / (endTimeValue - startTimeValue);

			li = dom.element('li');
			var eventLink = dom.element('a', {'href':'/programme/' + result.programme.id});
			var eventClassName = (i===0) ? 'event now' : 'event';
			var eventArticle = dom.element('article', {'class': eventClassName});

			var eventTimeBox = dom.element('div', {'class':'event-time-box'});
			var eventPrettyDate = dom.element('time', {'class':'event-prettyDate'});
			var eventStartTime = dom.element('time', {'class':'event-starttime'});
			eventStartTime.appendChild(document.createTextNode(time));
			eventPrettyDate.appendChild(document.createTextNode('TODO: prettydate'));

			eventTimeBox.appendChild(eventPrettyDate);
			eventTimeBox.appendChild(eventStartTime);
			eventArticle.appendChild(eventTimeBox);

			var eventHeader = dom.element('div', {'class':'event-header'});
			var eventTitle = dom.element('div', {'class':'event-title'});
			eventTitle.appendChild(document.createTextNode(results[i].programme.title));

			if (percentageComplete > 0) {
				var progressBar = dom.element('div', {'class':'progressbar', 'style':'width:' + percentageComplete + '%'});
				eventHeader.appendChild(progressBar);
			}
			eventHeader.appendChild(eventTitle);
			eventArticle.appendChild(eventHeader);

			var eventChannel = dom.element('aside', {'class':'event-channel','style':'background-image:url(' + channel.logo + ')'});
			eventChannel.appendChild(document.createTextNode(channel.name));
			eventArticle.appendChild(eventChannel);

			eventLink.appendChild(eventArticle);
			li.appendChild(eventLink);
			ul.appendChild(li);
		}
		eventListContainer.appendChild(ul);
		resultsContainer.appendChild(eventListContainer);
	}

	function renderNoResults() {
		var resultsContainer = document.getElementById('search-results');
		dom.empty(resultsContainer);

		var p = dom.element('p');
		p.appendChild(document.createTextNode(lang.translate('nothing-found')));
		resultsContainer.appendChild(p);
	}

/* public */

	function initialize() {

		lang = new Language(app.selectedLanguageCode);
						
		window.addEventListener('submit', submitHandler, false);

		Event.on(searchConfig.MODEL_CHANGED, onSearchModelChanged);

		return this;

	}

	function render() {

		now = new Date();
		renderPageStructure();

		return this;

	}

	function finalize() {

		hidePageStructure();
				
		window.removeEventListener('submit', submitHandler, false);

		Event.off(searchConfig.MODEL_CHANGED, onSearchModelChanged);

		return this;

	}


/* export */

	return new View({
		name		: name,
		initialize	: initialize,
		finalize	: finalize,
		render		: render
	});

});