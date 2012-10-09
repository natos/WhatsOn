/* 
* Language utility
* --------
*
* Usage:
*
* var lang = new Language('nl');
*
* searchText = lang.translate('nav-label-search'); // 'Zoeken'
* var now = new Date('2012-10-08'); // Monday 8 October 2012
* weekdayName = lang.translate('day-' + now.getDay()); // 'Maandag'
*
*/

define([

	'config/language',
	'utils/dom'

], function LanguageScope(allTranslations, dom) {


	function LanguageConstructor(languageCode) {

		var translations = allTranslations[languageCode];

		var translate = function(key) {
			return translations[key] || key;
		};

		/**
		* Set the text values for a list of named elements.
		* The translationsMap parameter is an array of objects:
		* [
		*   {ids:['id1', 'id2', ...], key: 'translationKey', action: function(el, translationValue){} },
		*   ...
		* ]
		*
		* Each object in the array is structured as follows:
		*   ids: an array of element IDs, whose text should be set to the translation
		* 	key: the translation key for the text
		*   action (optional): a function to be run after the element's text has been set
		*/
		var setTextForNamedElements = function(translationsMap) {

			var translationsMapItem, i, j, ids, el, translationValue, action;

			i = translationsMap.length;
			while (i--) {
				translationsMapItem = translationsMap[i];
				ids = translationsMapItem.ids;
				translationValue = this.translate(translationsMapItem['key']);
				action = translationsMapItem['action'];

				j = ids.length;
				while (j--) {
					el = document.getElementById(ids[j]);
					if (el) {
						dom.empty(el);
						el.appendChild(document.createTextNode(translationValue));
						if (action && typeof(action)=='function') {
							action.call(this, el, translationValue);
						}
					}
				}
			}

		};

		return {
			translate : translate,
			setTextForNamedElements : setTextForNamedElements
		};
	}

	return LanguageConstructor;

});